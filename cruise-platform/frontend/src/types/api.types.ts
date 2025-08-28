// Desktop App API Types for Cruise Platform

// Backend API Types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    errors?: string[];
}

export interface PaginationParams {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginationResponse {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// AI Types (matching backend)
export interface AiResponse {
    response: string;
    conversationId?: string;
    tokensUsed?: number;
    model?: string;
    timestamp: string;
}

export interface AiRequest {
    prompt: string;
    context?: string;
    conversationId?: string;
    temperature?: number;
    maxTokens?: number;
}

// Error Types
export interface ApiError {
    message: string;
    code?: string;
    field?: string;
    details?: any;
}

export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}

// Electron API types
export interface ElectronAPI {
    getAppVersion: () => Promise<string>;
    showMessageBox: (options: MessageBoxOptions) => Promise<MessageBoxResult>;
    showOpenDialog: (options: OpenDialogOptions) => Promise<OpenDialogResult>;
    showSaveDialog: (options: SaveDialogOptions) => Promise<SaveDialogResult>;
    store: {
        get: (key: string) => Promise<any>;
        set: (key: string, value: any) => Promise<void>;
        delete: (key: string) => Promise<void>;
    };
    showNotification: (options: NotificationOptions) => Promise<void>;
    openExternal: (url: string) => Promise<void>;
    onMenuAction: (callback: (event: any, action: string) => void) => void;
    onPreferencesOpen: (callback: () => void) => void;
    removeAllListeners: (channel: string) => void;
}

// Dialog types
export interface MessageBoxOptions {
    type?: 'info' | 'error' | 'question' | 'warning';
    title?: string;
    message: string;
    detail?: string;
    buttons?: string[];
    defaultId?: number;
    cancelId?: number;
}

export interface MessageBoxResult {
    response: number;
    checkboxChecked?: boolean;
}

export interface OpenDialogOptions {
    title?: string;
    defaultPath?: string;
    buttonLabel?: string;
    filters?: FileFilter[];
    properties?: Array<'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles'>;
}

export interface OpenDialogResult {
    canceled: boolean;
    filePaths: string[];
}

export interface SaveDialogOptions {
    title?: string;
    defaultPath?: string;
    buttonLabel?: string;
    filters?: FileFilter[];
}

export interface SaveDialogResult {
    canceled: boolean;
    filePath?: string;
}

export interface FileFilter {
    name: string;
    extensions: string[];
}

// Notification types
export interface NotificationOptions {
    title: string;
    body: string;
    icon?: string;
    silent?: boolean;
    urgency?: 'normal' | 'critical' | 'low';
}

// Platform information
export interface PlatformInfo {
    os: 'win32' | 'darwin' | 'linux';
    arch: string;
    versions: Record<string, string>;
}

// Feature flags
export interface FeatureFlags {
    fileSystem: boolean;
    notifications: boolean;
    autoUpdater: boolean;
    menuBar: boolean;
    systemIntegration: boolean;
}

// App preferences
export interface AppPreferences {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    autoStart: boolean;
    notifications: boolean;
    minimizeToTray: boolean;
    hardwareAcceleration: boolean;
    dataCollection: boolean;
}

// API Response types
export interface APIResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// User types
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    preferences: AppPreferences;
    createdAt: string;
    updatedAt: string;
}

// Project types
export interface Project {
    id: string;
    userId: string;
    title: string;
    description: string;
    status: 'draft' | 'active' | 'completed' | 'archived';
    industry: string;
    targetMarket: string;
    createdAt: string;
    updatedAt: string;
}

// AI Assistant types
export interface ChatMessage {
    id: string;
    type: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    attachments?: Attachment[];
}

export interface Attachment {
    id: string;
    type: 'file' | 'image' | 'url' | 'data';
    name: string;
    url?: string;
    data?: any;
    size?: number;
}

export interface AIAssistantRequest {
    message: string;
    context?: string;
    projectId?: string;
    attachments?: Attachment[];
}

export interface AIAssistantResponse {
    message: string;
    suggestions?: string[];
    actions?: AIAction[];
    data?: any;
}

export interface AIAction {
    type: 'web_scrape' | 'linkedin_search' | 'create_slide' | 'save_data';
    label: string;
    parameters: Record<string, any>;
}

// Web scraping types
export interface ScrapeRequest {
    url: string;
    selector?: string;
    extractType?: 'text' | 'html' | 'data' | 'all';
    aiAnalysis?: boolean;
}

export interface ScrapeResult {
    url: string;
    title: string;
    content: string;
    data: Record<string, any>;
    analysis?: string;
    timestamp: string;
}

// LinkedIn types
export interface LinkedInProfile {
    id: string;
    name: string;
    headline: string;
    location: string;
    industry: string;
    connections: number;
    profileUrl: string;
}

export interface LinkedInCampaign {
    id: string;
    name: string;
    targetAudience: string;
    messageTemplate: string;
    status: 'draft' | 'active' | 'paused' | 'completed';
    contacts: LinkedInContact[];
    stats: CampaignStats;
}

export interface LinkedInContact {
    id: string;
    profile: LinkedInProfile;
    status: 'pending' | 'connected' | 'messaged' | 'replied' | 'declined';
    lastInteraction: string;
    notes?: string;
}

export interface CampaignStats {
    sent: number;
    delivered: number;
    opened: number;
    replied: number;
    connected: number;
}

// Pitch deck types
export interface PitchDeck {
    id: string;
    projectId: string;
    title: string;
    slides: Slide[];
    template: string;
    status: 'draft' | 'completed' | 'presenting';
    createdAt: string;
    updatedAt: string;
}

export interface Slide {
    id: string;
    type: 'title' | 'problem' | 'solution' | 'market' | 'product' | 'team' | 'financials' | 'custom';
    title: string;
    content: SlideContent;
    order: number;
}

export interface SlideContent {
    text?: string;
    images?: string[];
    charts?: ChartData[];
    bullets?: string[];
    layout: 'text' | 'image' | 'split' | 'chart' | 'bullets';
}

export interface ChartData {
    type: 'bar' | 'line' | 'pie' | 'doughnut';
    data: any;
    options?: any;
}

// File operations
export interface FileOperation {
    type: 'read' | 'write' | 'delete' | 'move' | 'copy';
    path: string;
    data?: any;
    options?: any;
}

// Window states
export interface WindowState {
    isMaximized: boolean;
    isMinimized: boolean;
    isFullscreen: boolean;
    bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

// App state
export interface AppState {
    isOnline: boolean;
    version: string;
    platform: PlatformInfo;
    features: FeatureFlags;
    user?: User;
    currentProject?: Project;
    windowState: WindowState;
}

// Global window interface extension
declare global {
    interface Window {
        electronAPI?: ElectronAPI;
        platform?: PlatformInfo;
        features?: FeatureFlags;
        isElectron?: boolean;
    }
}