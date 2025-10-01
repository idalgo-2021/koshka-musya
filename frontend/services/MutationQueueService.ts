import { ChecklistItemFull } from '@/entities/checklist/api'
import { ChecklistApi } from '@/entities/checklist/api'

export interface QueueItem {
  id: string
  type: 'reorder_items'
  sectionId: number
  items: ChecklistItemFull[]
  timestamp: number
  retryCount: number
  maxRetries: number
}

export interface QueueStatus {
  isProcessing: boolean
  queueLength: number
  currentOperation: QueueItem | null
  completedCount: number
  failedCount: number
}

export interface QueueCallbacks {
  onStart?: (item: QueueItem) => void
  onSuccess?: (item: QueueItem) => void
  onError?: (item: QueueItem, error: Error) => void
  onComplete?: (status: QueueStatus) => void
}

export class MutationQueueService {
  private queue: QueueItem[] = []
  private isProcessing = false
  private currentOperation: QueueItem | null = null
  private completedCount = 0
  private failedCount = 0
  private listeners: Set<() => void> = new Set()
  private callbacks: QueueCallbacks = {}

  // State management
  private notifyListeners() {
    this.listeners.forEach(listener => listener())
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  getStatus(): QueueStatus {
    return {
      isProcessing: this.isProcessing,
      queueLength: this.queue.length,
      currentOperation: this.currentOperation,
      completedCount: this.completedCount,
      failedCount: this.failedCount
    }
  }

  // Queue management
  addReorderOperation(sectionId: number, items: ChecklistItemFull[], originalItems?: ChecklistItemFull[]): string {
    const operationId = `reorder_${sectionId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Filter to only include items that changed their sort_order
    let itemsToUpdate: ChecklistItemFull[] = items
    
    if (originalItems && originalItems.length > 0) {
      // Create a map of original items by ID for quick lookup
      const originalItemsMap = new Map(originalItems.map(item => [item.id, item]))
      
      // Only include items where sort_order has changed
      itemsToUpdate = items.filter(item => {
        const originalItem = originalItemsMap.get(item.id)
        return originalItem && originalItem.sort_order !== item.sort_order
      })
    }

    // If no items actually changed, don't add to queue
    if (itemsToUpdate.length === 0) {
      return operationId
    }

    const queueItem: QueueItem = {
      id: operationId,
      type: 'reorder_items',
      sectionId,
      items: itemsToUpdate, // Only items that changed
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: 3
    }

    // Remove any existing reorder operations for the same section
    this.queue = this.queue.filter(item => 
      !(item.type === 'reorder_items' && item.sectionId === sectionId)
    )

    this.queue.push(queueItem)
    this.notifyListeners()

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processQueue()
    }

    return operationId
  }

  setCallbacks(callbacks: QueueCallbacks) {
    this.callbacks = { ...callbacks }
  }

  // Queue processing
  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return
    }

    this.isProcessing = true
    this.notifyListeners()

    while (this.queue.length > 0) {
      const item = this.queue.shift()!
      this.currentOperation = item
      this.notifyListeners()

      try {
        this.callbacks.onStart?.(item)
        await this.executeOperation(item)
        this.completedCount++
        this.callbacks.onSuccess?.(item)
      } catch (error) {
        this.handleOperationError(item, error as Error)
      }

      this.currentOperation = null
      this.notifyListeners()
    }

    this.isProcessing = false
    this.callbacks.onComplete?.(this.getStatus())
    this.notifyListeners()
  }

  private async executeOperation(item: QueueItem): Promise<void> {
    switch (item.type) {
      case 'reorder_items':
        await this.executeReorderOperation(item)
        break
      default:
        throw new Error(`Unknown operation type: ${item.type}`)
    }
  }

  private async executeReorderOperation(item: QueueItem): Promise<void> {
    const { items } = item

    // Update each item's sort_order
    const updatePromises = items.map(item => 
      ChecklistApi.updateItem(item.id, { sort_order: item.sort_order })
    )

    await Promise.all(updatePromises)
  }

  private handleOperationError(item: QueueItem, error: Error) {
    console.error(`Operation ${item.id} failed:`, error)

    if (item.retryCount < item.maxRetries) {
      // Retry the operation
      item.retryCount++
      this.queue.unshift(item) // Add back to front of queue
    } else {
      // Max retries reached, mark as failed
      this.failedCount++
      this.callbacks.onError?.(item, error)
    }
  }

  // Queue control methods
  clear() {
    this.queue = []
    this.isProcessing = false
    this.currentOperation = null
    this.completedCount = 0
    this.failedCount = 0
    this.notifyListeners()
  }

  pause() {
    this.isProcessing = false
    this.notifyListeners()
  }

  resume() {
    if (!this.isProcessing && this.queue.length > 0) {
      this.processQueue()
    }
  }

  removeOperation(operationId: string) {
    this.queue = this.queue.filter(item => item.id !== operationId)
    this.notifyListeners()
  }

  // Utility methods
  getQueueLength(): number {
    return this.queue.length
  }

  isQueueEmpty(): boolean {
    return this.queue.length === 0
  }

  getNextOperation(): QueueItem | null {
    return this.queue.length > 0 ? this.queue[0] : null
  }

  // Batch operations
  addBatchReorderOperations(operations: Array<{ sectionId: number; items: ChecklistItemFull[]; originalItems?: ChecklistItemFull[] }>): string[] {
    const operationIds: string[] = []
    
    operations.forEach(({ sectionId, items, originalItems }) => {
      const id = this.addReorderOperation(sectionId, items, originalItems)
      operationIds.push(id)
    })

    return operationIds
  }

  // Statistics
  getStatistics() {
    return {
      totalProcessed: this.completedCount + this.failedCount,
      successRate: this.completedCount / (this.completedCount + this.failedCount) || 0,
      averageRetries: this.queue.reduce((sum, item) => sum + item.retryCount, 0) / this.queue.length || 0
    }
  }
}

// Singleton instance
export const mutationQueueService = new MutationQueueService()
