import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        username?: string;
    };
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginationQuery {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface LinkedInProfile {
    id: string;
    firstName: string;
    lastName: string;
    headline?: string;
    publicProfileUrl?: string;
    profilePicture?: string;
    industry?: string;
    location?: string;
}

export interface LinkedInCampaign {
    id: string;
    name: string;
    status: 'active' | 'paused' | 'completed';
    targetAudience: string[];
    message: string;
    createdAt: Date;
    updatedAt: Date;
    metrics?: {
        sent: number;
        delivered: number;
        opened: number;
        replied: number;
    };
}