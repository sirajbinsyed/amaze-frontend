"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { type Customer, type CreateCustomerRequest, type UpdateCustomerRequest } from "@/lib/api"

interface CustomerFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  customer?: Customer | null
  mode: 'create' | 'edit'
}

export function CustomerForm({ isOpen, onClose, onSuccess, customer, mode }: CustomerFormProps) {
  const [formData, setFormData] = useState<CreateCustomerRequest>({
    customer_name: '',
    mobile_number: '',
    whatsapp_number: '',
    address: '',
    requirements: '',
  })
  const [status, setStatus] = useState<'cold' | 'warm' | 'hot' | 'converted' | 'lost'>('cold')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Reset form when dialog opens/closes or customer changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && customer) {
        setFormData({
          customer_name: customer.customer_name,
          mobile_number: customer.mobile_number,
          whatsapp_number: customer.whatsapp_number,
          address: customer.address,
          requirements: customer.requirements,
        })
        setStatus(customer.status)
      } else {
        setFormData({
          customer_name: '',
          mobile_number: '',
          whatsapp_number: '',
          address: '',
          requirements: '',
        })
        setStatus('cold')
      }
      setError('')
    }
  }, [isOpen, mode, customer])

  const handleInputChange = (field: keyof CreateCustomerRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { ApiClient } = await import('@/lib/api')
      
      if (mode === 'create') {
        await ApiClient.createCustomer(formData)
      } else if (mode === 'edit' && customer) {
        const updateData: UpdateCustomerRequest = { 
          ...formData,
          status: status
        }
        await ApiClient.updateCustomer(customer.id, updateData)
      }
      
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const statusOptions = [
    { value: 'cold', label: 'Cold', color: 'text-blue-600' },
    { value: 'warm', label: 'Warm', color: 'text-orange-600' },
    { value: 'hot', label: 'Hot', color: 'text-red-600' },
    { value: 'converted', label: 'Converted', color: 'text-green-600' },
    { value: 'lost', label: 'Lost', color: 'text-gray-600' },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add New Customer' : 'Edit Customer'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Fill in the customer details below.'
              : 'Update the customer information below.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer_name">Customer Name *</Label>
            <Input
              id="customer_name"
              value={formData.customer_name}
              onChange={(e) => handleInputChange('customer_name', e.target.value)}
              placeholder="Enter customer full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile_number">Mobile Number *</Label>
            <Input
              id="mobile_number"
              type="tel"
              value={formData.mobile_number}
              onChange={(e) => handleInputChange('mobile_number', e.target.value)}
              placeholder="Enter mobile number"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp_number">WhatsApp Number *</Label>
            <Input
              id="whatsapp_number"
              type="tel"
              value={formData.whatsapp_number}
              onChange={(e) => handleInputChange('whatsapp_number', e.target.value)}
              placeholder="Enter WhatsApp number"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter complete address"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements *</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => handleInputChange('requirements', e.target.value)}
              placeholder="Describe customer requirements"
              rows={4}
              required
            />
          </div>

          {mode === 'edit' && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: 'cold' | 'warm' | 'hot' | 'converted' | 'lost') => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className={option.color}>{option.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : mode === 'create' ? 'Add Customer' : 'Update Customer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
