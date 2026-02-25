
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string | null;
  price: number;
  storePrice?: number;
  stock: number;
  imageUrls: string[];
  status: 'pending_details' | 'active';
  
  brand?: string;
  model?: string;
  color?: string;
  power?: string;
  dimensions?: string;
  weight?: string;
  compatibility?: string;
  otherSpecs?: string;

  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// FIX: Change to value export to be used in runtime checks.
export enum SaleItemType {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
}

export interface SaleTransaction {
  id: string;
  itemId: string;
  itemType: SaleItemType;
  itemName: string;
  quantitySold: number;
  pricePerItem: number;
  totalAmount: number;
  date: string; // ISO string
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  // For optimistic updates
  updatedProduct?: Product;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string; // ISO string
  category: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AiProductSuggestion {
  name: string;
  description: string;
  category: string;
  brand?: string | null;
  model?: string | null;
  color?: string | null;
  power?: string | null;
  dimensions?: string | null;
  weight?: string | null;
  compatibility?: string | null;
  otherSpecs?: string | null;
}

// For Recharts
export interface ChartDataPoint {
  date: string;
  value: number;
}

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string; // Added name
  username: string; // Added username for consistency
  email: string;
  cpfCnpj?: string; // Corrected from cpf
  password?: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type PendingServiceStatus = 'Pendente' | 'Em Análise' | 'Aguardando Peças' | 'Serviço Concluído' | 'Pronto para Retirada' | 'Entregue';

export const PENDING_SERVICE_STATUSES: PendingServiceStatus[] = [
  'Pendente', 'Em Análise', 'Aguardando Peças', 'Serviço Concluído', 'Pronto para Retirada', 'Entregue',
];

export type ServicePriority = 1 | 2 | 3; // 1: Alta, 2: Normal, 3: Baixa

export const SERVICE_PRIORITY_OPTIONS: { label: string; value: ServicePriority; badgeClass: string; }[] = [
  { label: 'Normal', value: 2, badgeClass: 'bg-yellow-100 text-yellow-800' }, 
  { label: 'Alta', value: 1, badgeClass: 'bg-red-100 text-red-800' }, 
  { label: 'Baixa', value: 3, badgeClass: 'bg-green-100 text-green-800' },
];

export interface PendingService {
  id: string;
  customerName: string;
  customerPhone: string;
  itemDescription: string;
  serviceNotes: string;
  status: PendingServiceStatus;
  priority: ServicePriority;
  imageUrl?: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export type LoginResult = 'success' | 'user_not_found' | 'invalid_password' | 'network_error' | 'unknown_error';

export interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  users: User[];
  login: (identifier: string, passwordAttempt: string) => Promise<LoginResult>;
  logout: () => void;
  addUser: (newUser: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'emailVerified' | 'username'>) => Promise<boolean>;
  removeUser: (userId: string) => Promise<void>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  isLoadingAuth: boolean;
  fetchUsers: () => Promise<void>;
}

export type TicketStatus = 'OPEN' | 'CLOSED';
export const ALL_TICKET_STATUSES: TicketStatus[] = ['OPEN', 'CLOSED'];

export interface Ticket {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: TicketStatus;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicketData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}


export interface PurchaseItemData {
  id: string; 
  itemName: string;
  quantity: number;
}

export type PurchaseRequestItemStatus = 'Pendente' | 'Comprado' | 'Recebido' | 'Cancelado';

export interface PurchaseRequestItem extends Omit<PurchaseItemData, 'id'> {
    id: string;
    purchaseRequestId: string;
    status: PurchaseRequestItemStatus;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PurchaseRequestData {
  items: Array<Omit<PurchaseItemData, 'id'>>;
  globalNotes?: string;
}

export type PurchaseRequestStatus = 'Pendente' | 'Aprovada' | 'Reprovada' | 'Enviada ao Fornecedor' | 'Recebida Parcialmente' | 'Recebida Totalmente' | 'Cancelada' | 'Finalizada';
export const ALL_PURCHASE_REQUEST_STATUSES: PurchaseRequestStatus[] = ['Pendente', 'Aprovada', 'Reprovada', 'Enviada ao Fornecedor', 'Recebida Parcialmente', 'Recebida Totalmente', 'Cancelada', 'Finalizada'];

export interface PurchaseRequest {
  id: string;
  items: PurchaseRequestItem[];
  globalNotes?: string;
  status: PurchaseRequestStatus;
  user: { name: string };
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Base64ImageUploaderProps {
  onImageUploaded: (base64Data: string | null, mimeType: string | null, originalFile: File | null) => void;
  currentImageUrl?: string;
  label?: string;
}

export interface ImageUploadFieldProps {
  onChange: (url: string | null) => void;
  value?: string;
  label?: string;
}

export interface ProductFormData extends Partial<Omit<Product, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'price' | 'storePrice' | 'stock'>> {
  price?: number;
  storePrice?: number;
  stock?: number;
  imageUrl?: string;
  imageBase64?: string;
  imageMimeType?: string;
  aiKeywords?: string;
}

export interface PendingServiceFormData {
  customerName: string;
  customerPhone: string;
  itemDescription: string;
  serviceNotes: string;
  status: PendingServiceStatus;
  priority: ServicePriority;
  imageUrl?: string;
  imageBase64?: string;
  imageMimeType?: string;
}

export interface DraftProductLine {
  id: string; // client-side id
  name: string;
  description: string;
  category: string;
  price: number;
  storePrice?: number;
  stock: number;
  status: 'pending_details' | 'active';
  brand?: string;
  model?: string;
  color?: string;
  power?: string;
  dimensions?: string;
  weight?: string;
  compatibility?: string;
  otherSpecs?: string;
  imageUrls?: string[];
  // FIX: Add imageUrl property for local preview URL before upload completes.
  imageUrl?: string;
  aiKeywords?: string;
  imageBase64?: string;
  imageMimeType?: string;
  imageFile?: File;
  isAiProcessing: boolean;
  aiError?: string;
}

// Types from Site, now used by system
export interface SiteSettings {
  id?: string;
  siteName: string;
  siteDescription: string;
  logoUrl?: string;
  faviconUrl?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string; // Campo do DB
  storeAddress?: string; // Campo do Frontend
  storeHours?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  maintenanceMode: boolean;
  asaasApiKey?: string;
  asaasWebhookSecret?: string;
  jwtSecret?: string;
  emailHost?: string;
  emailPort?: number;
  emailUser?: string;
  emailPass?: string;
  emailFrom?: string;
}

export interface Order {
  id: string;
  createdAt: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  customerName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  trackingCode?: string;
  trackingUrl?: string;
  items: OrderItem[];
  user: { name: string; email: string; phone?: string; }
}

export interface OrderItem {
  id: string;
  product?: { name: string };
  course?: { title: string };
  quantity: number;
  price: number;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    instructor: string;
    duration: string;
    level?: 'Iniciante' | 'Intermediário' | 'Avançado';
    price: number;
    imageUrl?: string;
    type: 'PRESENCIAL' | 'GRAVADO';
    createdAt: string;
    updatedAt: string;
}

export type CourseCreationData = Omit<Course, 'id' | 'createdAt' | 'updatedAt'>;

export interface CourseAccessRequest {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  user: { id: string; name: string; email: string; };
  course: { id: string; title: string; };
  createdAt: string;
}
