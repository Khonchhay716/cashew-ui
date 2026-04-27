export interface CashewType {
  id: number; name: string; defaultPrice: number; description?: string; isActive: boolean
}

export interface ItemDto {
  id: number; cashewTypeId: number; cashewTypeName: string
  qtyKg: number; pricePerKg: number; total: number
}

export interface Purchase {
  id: number; referenceNo: string
  supplierName?: string; supplierPhone?: string
  totalAmount: number; note?: string
  purchaseDate: string; createdBy: string
  items: ItemDto[]
}

export interface Sale {
  id: number; referenceNo: string
  customerName?: string; customerPhone?: string
  totalAmount: number; note?: string
  saleDate: string; createdBy: string
  items: ItemDto[]
}

export interface ChartData { label: string; value: number }

export interface Dashboard {
  totalPurchaseKg: number; totalPurchasePrice: number
  totalSaleKg: number; totalSalePrice: number; profit: number
  purchaseCount: number; saleCount: number
  purchaseChart: ChartData[]; saleChart: ChartData[]
}

export interface PagedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  summaryKg: number 
  summaryPrice: number
}

// Form item row
export interface FormItem {
  cashewTypeId: number; qtyKg: string; pricePerKg: string
}
