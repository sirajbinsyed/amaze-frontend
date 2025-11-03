// src/components/AssignTaskForm.tsx

"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns" // ADDED: For formatting the date
import { Calendar as CalendarIcon } from "lucide-react" // ADDED: For the date picker button icon
import { cn } from "@/lib/utils" // ADDED: Utility for conditional class names

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea" // ADDED: For the description field
import { Calendar } from "@/components/ui/calendar" // ADDED: For the date picker
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover" // ADDED: For the date picker
import { useToast } from "@/components/ui/use-toast"
// UPDATED: The 'assignTask' function signature and payload will need to be updated in this file.
import { assignTask, type Order, type Staff } from "@/lib/admin" // Adjust path if necessary

interface AssignTaskFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  project: Order | null
  staffList: Staff[]
}

export function AssignTaskForm({ isOpen, onClose, onSuccess, project, staffList }: AssignTaskFormProps) {
  const [selectedStaffId, setSelectedStaffId] = useState<string>("")
  const [taskDescription, setTaskDescription] = useState<string>("") // ADDED: State for the task description
  const [completionDate, setCompletionDate] = useState<Date | undefined>() // ADDED: State for the completion date
  const [isAssigning, setIsAssigning] = useState(false)
  const { toast } = useToast()

  // Reset the form state when the dialog is closed or the project changes
  useEffect(() => {
    if (!isOpen) {
      setSelectedStaffId("")
      setTaskDescription("") // ADDED: Reset description
      setCompletionDate(undefined) // ADDED: Reset date
    }
  }, [isOpen])

  const handleAssign = async () => {
    // UPDATED: Guard clause to ensure all required data is present
    if (!project || !project.id || !selectedStaffId || !taskDescription || !completionDate) {
      toast({
        title: "Error",
        description: "Please select a staff member, enter a description, and pick a completion date.",
        variant: "destructive",
      })
      return
    }

    setIsAssigning(true)

    // UPDATED: Create a single payload object with the new fields for the API call
    // NOTE: You will need to update your `assignTask` function in `lib/project.ts`
    // to accept `description` and `completion_date`.
    const payload = {
      order_id: project.id,
      staff_id: parseInt(selectedStaffId, 10),
      description: taskDescription,
      completion_date: completionDate.toISOString(), // Send date in a standard format
    }

    const response = await assignTask(payload)
    setIsAssigning(false)

    if (response.error) {
      toast({
        title: "Assignment Failed",
        description: response.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: `Project PRJ-${project.id} has been assigned successfully.`,
      })
      onSuccess() // Notify parent component to refresh its data
      onClose()   // Close the dialog after successful assignment
    }
  }

  // Render nothing if there's no project data
  if (!project) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Task for Project PRJ-{project.id}</DialogTitle>
          <DialogDescription>
            Select a staff member and provide task details for: "{project.description}"
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Staff Selector */}
          <div className="grid gap-2">
            <Label htmlFor="staff-select">Assign To</Label>
            <Select onValueChange={setSelectedStaffId} value={selectedStaffId}>
              <SelectTrigger id="staff-select">
                <SelectValue placeholder="Select a staff member..." />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(staffList) && staffList.length > 0 ? (
                  staffList.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id.toString()}>
                      {staff.name} ({staff.role})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No active staff found.
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* ADDED: Task Description Field */}
          <div className="grid gap-2">
            <Label htmlFor="task-description">Task Description</Label>
            <Textarea
              id="task-description"
              placeholder="Enter the specific task for the staff member..."
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
            />
          </div>

          {/* ADDED: Completion Date Picker */}
          <div className="grid gap-2">
            <Label htmlFor="completion-date">Expected Completion Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="completion-date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !completionDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {completionDate ? format(completionDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={completionDate}
                  onSelect={setCompletionDate}
                  initialFocus
                  disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))} // Disable past dates
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {/* UPDATED: Disable button if any of the new fields are empty */}
          <Button
            onClick={handleAssign}
            disabled={!selectedStaffId || !taskDescription || !completionDate || isAssigning}
          >
            {isAssigning ? "Assigning..." : "Assign Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}