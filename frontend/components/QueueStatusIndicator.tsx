"use client"

import * as React from 'react'
import { Loader2, CheckCircle, XCircle, Clock, Pause, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useMutationQueue } from '@/hooks/useMutationQueue'

interface QueueStatusIndicatorProps {
  className?: string
  showControls?: boolean
  compact?: boolean
}

export function QueueStatusIndicator({
  className = '',
  showControls = true,
  compact = false
}: QueueStatusIndicatorProps) {
  const {
    pause,
    resume,
    clear,
    isProcessing,
    queueLength,
    currentOperation,
    completedCount,
    failedCount
  } = useMutationQueue()

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {isProcessing && (
          <div className="flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span className="text-xs text-muted-foreground">
              {queueLength > 0 ? `${queueLength} pending` : 'Processing...'}
            </span>
          </div>
        )}

        {!isProcessing && queueLength > 0 && (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span className="text-xs text-muted-foreground">
              {queueLength} queued
            </span>
          </div>
        )}

        {completedCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            <CheckCircle className="w-3 h-3 mr-1" />
            {completedCount}
          </Badge>
        )}

        {failedCount > 0 && (
          <Badge variant="destructive" className="text-xs">
            <XCircle className="w-3 h-3 mr-1" />
            {failedCount}
          </Badge>
        )}
      </div>
    )
  }

  return (
    <div className={`bg-white border rounded-lg p-3 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium">Mutation Queue</h4>
        {showControls && (
          <div className="flex items-center gap-1">
            {isProcessing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={pause}
                className="h-6 px-2"
              >
                <Pause className="w-3 h-3" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={resume}
                className="h-6 px-2"
                disabled={queueLength === 0}
              >
                <Play className="w-3 h-3" />
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={clear}
              className="h-6 px-2"
              disabled={queueLength === 0 && !isProcessing}
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {/* Status */}
        <div className="flex items-center gap-2">
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-sm text-blue-600">Processing...</span>
            </>
          ) : queueLength > 0 ? (
            <>
              <Clock className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-yellow-600">Queued ({queueLength})</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600">Idle</span>
            </>
          )}
        </div>

        {/* Current Operation */}
        {currentOperation && (
          <div className="text-xs text-muted-foreground">
            <div className="font-medium">Current Operation:</div>
            <div className="ml-2">
              {currentOperation.type === 'reorder_items' && (
                <>Updating {currentOperation.items.length} item{currentOperation.items.length !== 1 ? 's' : ''} in section {currentOperation.sectionId}</>
              )}
            </div>
            {currentOperation.retryCount > 0 && (
              <div className="ml-2 text-orange-600">
                Retry {currentOperation.retryCount}/{currentOperation.maxRetries}
              </div>
            )}
          </div>
        )}

        {/* Statistics */}
        <div className="flex items-center gap-4 text-xs">
          {completedCount > 0 && (
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>{completedCount} completed</span>
            </div>
          )}

          {failedCount > 0 && (
            <div className="flex items-center gap-1">
              <XCircle className="w-3 h-3 text-red-500" />
              <span>{failedCount} failed</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {queueLength > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-blue-500 h-1 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, (completedCount / (completedCount + queueLength + failedCount)) * 100)}%`
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default QueueStatusIndicator
