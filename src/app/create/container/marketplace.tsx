'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit, Save, X, Check, Type, Hash, List, TextCursorInput, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/app/context/authcontext'

interface Marketplace {
  _id: string
  name: string
  slug: string
  description: string
  icon?: string
  colorScheme: {
    primary: string
    secondary: string
  }
  active: boolean
}

interface Service {
  _id: string
  marketplace: string
  name: string
  description: string
  discountPercentage: number
  orderFormFields: FormField[]
  active: boolean
}

interface FormField {
  label: string
  type: 'text' | 'number' | 'select' | 'textarea'
  required: boolean
  options?: string[]
}

const Endpoint = "https://api.ghostmarket.net"

export default function MarketplaceManager() {
  const { token } = useAuth()
  
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('marketplaces')

  // Marketplace states
  const [newMarketplace, setNewMarketplace] = useState<Omit<Marketplace, '_id' | 'slug'>>({
    name: '',
    description: '',
    colorScheme: { primary: '#4f46e5', secondary: '#6366f1' },
    active: true
  })
  const [editingMarketplace, setEditingMarketplace] = useState<Marketplace | null>(null)
  const [confirmDeleteMarketplace, setConfirmDeleteMarketplace] = useState<string | null>(null)

  // Service states
  const [newService, setNewService] = useState<Omit<Service, '_id'>>({
    marketplace: '',
    name: '',
    description: '',
    discountPercentage: 0,
    orderFormFields: [],
    active: true
  })
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [confirmDeleteService, setConfirmDeleteService] = useState<string | null>(null)
  const [currentField, setCurrentField] = useState<FormField>({
    label: '',
    type: 'text',
    required: false
  })

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        }
        
        const [marketRes, serviceRes] = await Promise.all([
          fetch(`${Endpoint}/admin/v1/marketplaces`, { headers }),
          fetch(`${Endpoint}/admin/v1/services`, { headers })
        ])
        


       // console.log(serviceRes)

        if (!marketRes.ok) throw new Error('Failed to fetch marketplaces')
        if (!serviceRes.ok) throw new Error('Failed to fetch services')
        
        const marketData = await marketRes.json()
        const serviceData = await serviceRes.json()
        
        setMarketplaces(marketData.marketplaces || [])
        setServices(serviceData.services || [])
      } catch (error) {
        console.error('Fetch error:', error)
        toast.error('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  // Marketplace handlers
  const handleCreateMarketplace = async () => {
    if (!newMarketplace.name) {
      toast.warning('Marketplace name is required')
      return
    }

    try {
      const res = await fetch(`${Endpoint}/admin/v1/marketplaces`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(newMarketplace)
      })
      
      if (!res.ok) throw new Error('Failed to create marketplace')
      
      const data = await res.json()
      setMarketplaces(prev => [...prev, data.marketplace])
      setNewMarketplace({
        name: '',
        description: '',
        colorScheme: { primary: '#4f46e5', secondary: '#6366f1' },
        active: true
      })
      toast.success('Marketplace created successfully')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleToggleMarketplace = async (id: string, active: boolean) => {
    try {
      const res = await fetch(`${Endpoint}/admin/v1/marketplaces/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ active })
      })
      
      if (!res.ok) throw new Error('Failed to update marketplace')
      
      setMarketplaces(prev => prev.map(mp => 
        mp._id === id ? { ...mp, active } : mp
      ))
      toast.success(`Marketplace ${active ? 'activated' : 'deactivated'}`)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleUpdateMarketplace = async () => {
    if (!editingMarketplace) return
    
    try {
      const res = await fetch(`${Endpoint}/admin/v1/marketplaces/${editingMarketplace._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(editingMarketplace)
      })
      
      if (!res.ok) throw new Error('Failed to update marketplace')
      
      setMarketplaces(prev => prev.map(mp => 
        mp._id === editingMarketplace._id ? editingMarketplace : mp
      ))
      setEditingMarketplace(null)
      toast.success('Marketplace updated successfully')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const confirmDeleteMarketplaceAction = async () => {
    if (!confirmDeleteMarketplace) return
    
    try {
      const res = await fetch(`${Endpoint}/admin/v1/marketplaces/${confirmDeleteMarketplace}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      })
      
      if (!res.ok) throw new Error('Failed to delete marketplace')
      
      setMarketplaces(prev => prev.filter(mp => mp._id !== confirmDeleteMarketplace))
      setConfirmDeleteMarketplace(null)
      toast.success('Marketplace deleted successfully')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  // Service handlers
  const handleToggleService = async (id: string, active: boolean) => {
    try {
      const res = await fetch(`${Endpoint}/admin/v1/services/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ active })
      })
      
      if (!res.ok) throw new Error('Failed to update service')
      
      setServices(prev => prev.map(service => 
        service._id === id ? { ...service, active } : service
      ))
      toast.success(`Service ${active ? 'activated' : 'deactivated'}`)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleAddFormField = () => {
    if (!currentField.label) {
      toast.warning('Field label is required')
      return
    }

    const field: FormField = {
      label: currentField.label,
      type: currentField.type,
      required: currentField.required,
      ...(currentField.type === 'select' && currentField.options 
        ? { options: (currentField.options as unknown as string).split(',').map(opt => opt.trim()) }
        : {})
    }

    if (editingService) {
      setEditingService(prev => ({
        ...prev!,
        orderFormFields: [...prev!.orderFormFields, field]
      }))
    } else {
      setNewService(prev => ({
        ...prev,
        orderFormFields: [...prev.orderFormFields, field]
      }))
    }
    
    setCurrentField({
      label: '',
      type: 'text',
      required: false
    })
  }

  const handleCreateService = async () => {
    if (!newService.marketplace) {
      toast.warning('Please select a marketplace')
      return
    }
    if (!newService.name) {
      toast.warning('Service name is required')
      return
    }

    try {
      const payload = {
        marketplaceId: newService.marketplace,
        name: newService.name,
        description: newService.description,
        discountPercentage: newService.discountPercentage,
        orderFormFields: newService.orderFormFields,
        active: newService.active
      }

      const res = await fetch(`${Endpoint}/admin/v1/services`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload)
      })
      
      if (!res.ok) throw new Error('Failed to create service')
      
      const data = await res.json()
      setServices(prev => [...prev, data.service])
      setNewService({
        marketplace: '',
        name: '',
        description: '',
        discountPercentage: 0,
        orderFormFields: [],
        active: true
      })
      toast.success('Service created successfully')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleEditService = (service: Service) => {
    setEditingService(service)
    setNewService({
      marketplace: '',
      name: '',
      description: '',
      discountPercentage: 0,
      orderFormFields: [],
      active: true
    })
  }

  const handleUpdateService = async () => {
    if (!editingService) return
    
    try {
      const payload = {
        marketplaceId: editingService.marketplace,
        name: editingService.name,
        description: editingService.description,
        discountPercentage: editingService.discountPercentage,
        orderFormFields: editingService.orderFormFields,
        active: editingService.active
      }

      const res = await fetch(`${Endpoint}/admin/v1/services/${editingService._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload)
      })
      
      if (!res.ok) throw new Error('Failed to update service')
      
      setServices(prev => prev.map(service => 
        service._id === editingService._id ? editingService : service
      ))
      setEditingService(null)
      toast.success('Service updated successfully')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const confirmDeleteServiceAction = async () => {
    if (!confirmDeleteService) return
    
    try {
      const res = await fetch(`${Endpoint}/admin/v1/services/${confirmDeleteService}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      })
      
      if (!res.ok) throw new Error('Failed to delete service')
      
      setServices(prev => prev.filter(service => service._id !== confirmDeleteService))
      setConfirmDeleteService(null)
      toast.success('Service deleted successfully')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  
  const getFieldIcon = (type: string) => {
    switch(type) {
      case 'text': return <Type className="h-4 w-4" />
      case 'number': return <Hash className="h-4 w-4" />
      case 'select': return <List className="h-4 w-4" />
      case 'textarea': return <TextCursorInput className="h-4 w-4" />
      default: return <Type className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Marketplace Management</h1>
        
      
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'marketplaces' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('marketplaces')}
          >
            Marketplaces
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'services' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('services')}
          >
            Services
          </button>
        </div>
        
        {/* Marketplaces Tab */}
        {activeTab === 'marketplaces' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Marketplace Card */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold flex items-center">
                  <Plus className="h-5 w-5 mr-2 text-indigo-600" />
                  {editingMarketplace ? 'Edit Marketplace' : 'Create New Marketplace'}
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      value={editingMarketplace ? editingMarketplace.name : newMarketplace.name}
                      onChange={(e) => editingMarketplace 
                        ? setEditingMarketplace({...editingMarketplace, name: e.target.value})
                        : setNewMarketplace({...newMarketplace, name: e.target.value})
                      }
                      placeholder="e.g., Galaxy Travel"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      value={editingMarketplace ? editingMarketplace.description : newMarketplace.description}
                      onChange={(e) => editingMarketplace
                        ? setEditingMarketplace({...editingMarketplace, description: e.target.value})
                        : setNewMarketplace({...newMarketplace, description: e.target.value})
                      }
                      placeholder="Brief description of your marketplace"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                      <div className="flex items-center">
                        <input
                          type="color"
                          className="h-10 w-10 cursor-pointer"
                          value={editingMarketplace ? editingMarketplace.colorScheme.primary : newMarketplace.colorScheme.primary}
                          onChange={(e) => editingMarketplace
                            ? setEditingMarketplace({
                                ...editingMarketplace,
                                colorScheme: {
                                  ...editingMarketplace.colorScheme,
                                  primary: e.target.value
                                }
                              })
                            : setNewMarketplace({
                                ...newMarketplace,
                                colorScheme: {
                                  ...newMarketplace.colorScheme,
                                  primary: e.target.value
                                }
                              })
                          }
                        />
                        <span className="ml-2 text-sm text-gray-600">
                          {editingMarketplace 
                            ? editingMarketplace.colorScheme.primary 
                            : newMarketplace.colorScheme.primary}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
                      <div className="flex items-center">
                        <input
                          type="color"
                          className="h-10 w-10 cursor-pointer"
                          value={editingMarketplace ? editingMarketplace.colorScheme.secondary : newMarketplace.colorScheme.secondary}
                          onChange={(e) => editingMarketplace
                            ? setEditingMarketplace({
                                ...editingMarketplace,
                                colorScheme: {
                                  ...editingMarketplace.colorScheme,
                                  secondary: e.target.value
                                }
                              })
                            : setNewMarketplace({
                                ...newMarketplace,
                                colorScheme: {
                                  ...newMarketplace.colorScheme,
                                  secondary: e.target.value
                                }
                              })
                          }
                        />
                        <span className="ml-2 text-sm text-gray-600">
                          {editingMarketplace 
                            ? editingMarketplace.colorScheme.secondary 
                            : newMarketplace.colorScheme.secondary}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={editingMarketplace ? editingMarketplace.active : newMarketplace.active}
                        onChange={(e) => editingMarketplace
                          ? setEditingMarketplace({...editingMarketplace, active: e.target.checked})
                          : setNewMarketplace({...newMarketplace, active: e.target.checked})
                        }
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      <span className="ml-3 text-sm font-medium text-gray-700">
                        {editingMarketplace 
                          ? editingMarketplace.active ? 'Active' : 'Inactive'
                          : newMarketplace.active ? 'Active' : 'Inactive'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                {editingMarketplace && (
                  <button
                    onClick={() => setEditingMarketplace(null)}
                    className="px-4 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={editingMarketplace ? handleUpdateMarketplace : handleCreateMarketplace}
                  disabled={!newMarketplace.name && !editingMarketplace}
                  className={`px-4 py-2 rounded-md text-white font-medium ${
                    (!newMarketplace.name && !editingMarketplace) 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  <Save className="h-4 w-4 mr-2 inline" />
                  {editingMarketplace ? 'Update Marketplace' : 'Create Marketplace'}
                </button>
              </div>
            </div>

            {/* Marketplaces List */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Marketplaces</h2>
              {marketplaces.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 text-center text-gray-500">
                  No marketplaces created yet
                </div>
              ) : (
                <div className="space-y-3">
                  {marketplaces.map((marketplace) => (
                    <div key={marketplace._id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className="h-8 w-8 rounded-full mr-3 flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: marketplace.colorScheme.primary }}
                          >
                            {marketplace.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-medium">{marketplace.name}</h3>
                            <p className="text-sm text-gray-500">{marketplace.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={marketplace.active}
                              onChange={(e) => handleToggleMarketplace(marketplace._id, e.target.checked)}
                            />
                            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                          </label>
                          <button 
                            className="p-1 text-gray-500 hover:text-indigo-600"
                            onClick={() => setEditingMarketplace(marketplace)}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            className="p-1 text-gray-500 hover:text-red-600"
                            onClick={() => setConfirmDeleteMarketplace(marketplace._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create/Edit Service Card */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold flex items-center">
                  <Plus className="h-5 w-5 mr-2 text-indigo-600" />
                  {editingService ? 'Edit Service' : 'Create New Service'}
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Marketplace</label>
                    <div className="relative">
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                        value={editingService ? editingService.marketplace : newService.marketplace}
                        onChange={(e) => editingService
                          ? setEditingService({...editingService, marketplace: e.target.value})
                          : setNewService({...newService, marketplace: e.target.value})
                        }
                        disabled={!!editingService}
                      >
                        <option value="">Select a marketplace</option>
                        {marketplaces.filter(m => m.active).map((marketplace) => (
                          <option key={marketplace._id} value={marketplace._id}>
                            {marketplace.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="h-4 w-4 absolute right-3 top-3 text-gray-400" />
                    </div>
                  </div>

                  {(editingService || newService.marketplace) && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          value={editingService ? editingService.name : newService.name}
                          onChange={(e) => editingService
                            ? setEditingService({...editingService, name: e.target.value})
                            : setNewService({...newService, name: e.target.value})
                          }
                          placeholder="e.g., Flight Booking"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          value={editingService ? editingService.description : newService.description}
                          onChange={(e) => editingService
                            ? setEditingService({...editingService, description: e.target.value})
                            : setNewService({...newService, description: e.target.value})
                          }
                          placeholder="Describe this service"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          value={editingService ? editingService.discountPercentage : newService.discountPercentage}
                          onChange={(e) => editingService
                            ? setEditingService({
                                ...editingService,
                                discountPercentage: parseInt(e.target.value) || 0
                              })
                            : setNewService({
                                ...newService,
                                discountPercentage: parseInt(e.target.value) || 0
                              })
                          }
                          placeholder="e.g., 20"
                        />
                      </div>
                      <div className="flex items-center">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={editingService ? editingService.active : newService.active}
                            onChange={(e) => editingService
                              ? setEditingService({...editingService, active: e.target.checked})
                              : setNewService({...newService, active: e.target.checked})
                            }
                          />
                          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                          <span className="ml-3 text-sm font-medium text-gray-700">
                            {editingService 
                              ? editingService.active ? 'Active' : 'Inactive'
                              : newService.active ? 'Active' : 'Inactive'}
                          </span>
                        </label>
                      </div>

                      {/* Form Fields Section */}
                      <div className="pt-4 mt-4 border-t border-gray-200">
                        <h3 className="font-medium text-gray-800 mb-3">Order Form Fields</h3>
                        
                        {/* Current Fields */}
                        <div className="space-y-2 mb-4">
                          {(editingService 
                            ? editingService.orderFormFields 
                            : newService.orderFormFields).map((field, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center">
                                <span className="text-gray-500 mr-2">
                                  {getFieldIcon(field.type)}
                                </span>
                                <span className="font-medium">{field.label}</span>
                                <span className="text-xs ml-2 px-2 py-1 bg-gray-100 rounded">
                                  {field.type}
                                </span>
                                {field.required && (
                                  <span className="text-xs ml-2 px-2 py-1 bg-red-100 text-red-600 rounded">
                                    Required
                                  </span>
                                )}
                              </div>
                              <button
                                className="p-1 text-gray-500 hover:text-red-600"
                                onClick={() => editingService
                                  ? setEditingService({
                                      ...editingService,
                                      orderFormFields: editingService.orderFormFields.filter((_, i) => i !== index)
                                    })
                                  : setNewService({
                                      ...newService,
                                      orderFormFields: newService.orderFormFields.filter((_, i) => i !== index)
                                    })
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        {/* Add New Field */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-sm mb-3">Add New Field</h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Field Label</label>
                              <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                value={currentField.label}
                                onChange={(e) => setCurrentField({...currentField, label: e.target.value})}
                                placeholder="e.g., T-Shirt Size"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Field Type</label>
                              <div className="relative">
                                <select
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                                  value={currentField.type}
                                  onChange={(e) => setCurrentField({
                                    ...currentField,
                                    type: e.target.value as 'text' | 'number' | 'select' | 'textarea'
                                  })}
                                >
                                  <option value="text">Text Input</option>
                                  <option value="number">Number Input</option>
                                  <option value="select">Dropdown</option>
                                  <option value="textarea">Text Area</option>
                                </select>
                                <ChevronDown className="h-4 w-4 absolute right-3 top-3 text-gray-400" />
                              </div>
                            </div>
                            {currentField.type === 'select' && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Options (comma separated)</label>
                                <input
                                  type="text"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                  value={currentField.options || ''}
                                  onChange={(e: any) => setCurrentField({...currentField, options: e.target.value})}
                                  placeholder="e.g., Small, Medium, Large"
                                />
                              </div>
                            )}
                            <div className="flex items-center">
                              <label className="inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={currentField.required}
                                  onChange={(e) => setCurrentField({...currentField, required: e.target.checked})}
                                />
                                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                <span className="ml-3 text-sm font-medium text-gray-700">
                                  Required Field
                                </span>
                              </label>
                            </div>
                            <button
                              onClick={handleAddFormField}
                              disabled={!currentField.label}
                              className={`w-full px-4 py-2 rounded-md text-white font-medium flex items-center justify-center ${!currentField.label ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Field
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                {editingService && (
                  <button
                    onClick={() => setEditingService(null)}
                    className="px-4 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={editingService ? handleUpdateService : handleCreateService}
                  disabled={(!newService.marketplace || !newService.name) && !editingService}
                  className={`px-4 py-2 rounded-md text-white font-medium ${
                    (!newService.marketplace || !newService.name) && !editingService
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  <Save className="h-4 w-4 mr-2 inline" />
                  {editingService ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </div>

            {/* Services List */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Services</h2>
              {services.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 text-center text-gray-500">
                  No services created yet
                </div>
              ) : (
                <div className="space-y-3">
                  {services.map((service) => {
                    const marketplace = marketplaces.find(m => m._id === service.marketplace)
                    return (
                      <div key={service._id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                        <div className="p-4 flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{service.name}</h3>
                            <p className="text-sm text-gray-500">
                              {marketplace?.name} • {service.discountPercentage}% discount
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <label className="inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={service.active}
                                onChange={() => handleToggleService(service._id, !service.active)}
                              />
                              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                            <button 
                              className="p-1 text-gray-500 hover:text-indigo-600"
                              onClick={() => handleEditService(service)}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              className="p-1 text-gray-500 hover:text-red-600"
                              onClick={() => setConfirmDeleteService(service._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="px-4 pb-4">
                          <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {service.orderFormFields.map((field, index) => (
                              <span
                                key={index}
                                className="text-xs px-2 py-1 bg-gray-100 rounded-full flex items-center"
                              >
                                {getFieldIcon(field.type)}
                                <span className="ml-1">{field.label}</span>
                                {field.required && (
                                  <span className="ml-1 text-red-500">*</span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modals */}
      {confirmDeleteMarketplace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this marketplace? This action cannot be undone.</p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDeleteMarketplace(null)}
                className="px-4 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteMarketplaceAction}
                className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this service? This action cannot be undone.</p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDeleteService(null)}
                className="px-4 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteServiceAction}
                className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}