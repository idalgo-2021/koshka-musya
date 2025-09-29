import { useState, useEffect, useCallback } from 'react'
import { mutationQueueService, type QueueStatus, type QueueCallbacks } from '@/services/MutationQueueService'
import { ChecklistItemFull } from '@/entities/checklist/api'

export function useMutationQueue() {
  const [status, setStatus] = useState<QueueStatus>(mutationQueueService.getStatus())

  useEffect(() => {
    const unsubscribe = mutationQueueService.subscribe(() => {
      setStatus(mutationQueueService.getStatus())
    })

    return () => unsubscribe()
  }, [])

  const addReorderOperation = useCallback((sectionId: number, items: ChecklistItemFull[], originalItems?: ChecklistItemFull[]): string => {
    return mutationQueueService.addReorderOperation(sectionId, items, originalItems)
  }, [])

  const addBatchReorderOperations = useCallback((operations: Array<{ sectionId: number; items: ChecklistItemFull[]; originalItems?: ChecklistItemFull[] }>): string[] => {
    return mutationQueueService.addBatchReorderOperations(operations)
  }, [])

  const setCallbacks = useCallback((callbacks: QueueCallbacks) => {
    mutationQueueService.setCallbacks(callbacks)
  }, [])

  const clear = useCallback(() => {
    mutationQueueService.clear()
  }, [])

  const pause = useCallback(() => {
    mutationQueueService.pause()
  }, [])

  const resume = useCallback(() => {
    mutationQueueService.resume()
  }, [])

  const removeOperation = useCallback((operationId: string) => {
    mutationQueueService.removeOperation(operationId)
  }, [])

  const getStatistics = useCallback(() => {
    return mutationQueueService.getStatistics()
  }, [])

  return {
    status,
    addReorderOperation,
    addBatchReorderOperations,
    setCallbacks,
    clear,
    pause,
    resume,
    removeOperation,
    getStatistics,
    // Convenience properties
    isProcessing: status.isProcessing,
    queueLength: status.queueLength,
    currentOperation: status.currentOperation,
    completedCount: status.completedCount,
    failedCount: status.failedCount,
    isQueueEmpty: status.queueLength === 0
  }
}
