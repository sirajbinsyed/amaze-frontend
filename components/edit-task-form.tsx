"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

// Import the API function and types
import { editTask, type EditTaskPayload, type DetailedTask } from "@/lib/project"

interface EditTaskFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  task: DetailedTask | null
}

export function EditTaskForm({ isOpen, onClose, onSuccess, task }: EditTaskFormProps) {
  const { toast } = useToast()
  
  // Form state
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("")
  const [completionTime, setCompletionTime] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Pre-fill the form when a task is selected
  useEffect(() => {
    if (task) {
      setDescription(task.task_description || "")
      setStatus(task.status || "")
      // Format the date for the datetime-local input, which needs YYYY-MM-DDTHH:MM
      const formattedDate = task.completion_time ? task.completion_time.slice(0, 16) : ""
      setCompletionTime(formattedDate)
    }
  }, [task])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!task) return

    setIsSubmitting(true)

    const payload: EditTaskPayload = {
      task_description: description,
      status: status,
      // Convert local datetime back to an ISO string for the API
      completion_time: completionTime ? new Date(completionTime).toISOString() : null,
    }

    const response = await editTask(task.id, payload)

    if (response.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: response.error,
      })
    } else {
      toast({
        title: "Success",
        description: "Task has been updated successfully.",
      })
      onSuccess() // Trigger data reload and close modal
    }

    setIsSubmitting(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Make changes to the task details. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="completionTime" className="text-right">
                Due Date
              </Label>
              <Input
                id="completionTime"
                type="datetime-local"
                value={completionTime}
                onChange={(e) => setCompletionTime(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}