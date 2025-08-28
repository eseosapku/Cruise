import React, { useState } from 'react';

interface Template {
    id: string;
    name: string;
    description: string;
    industry: string;
    thumbnail: string;
    slideCount: number;
    features: string[];
}

interface TemplateSelectorProps {
    onSelectTemplate?: (template: Template, title: string, description?: string) => void;
    loading?: boolean;
    className?: string;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
    onSelectTemplate,
    loading = false,
    className = ''
}) => {
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const templates: Template[] = [
        {
            id: 'startup-pitch',
            name: 'Startup Pitch',
            description: 'Perfect for seed and Series A funding rounds',
            industry: 'Technology',
            thumbnail: '🚀',
            slideCount: 12,
            features: ['Problem & Solution', 'Market Size', 'Business Model', 'Financial Projections']
        },
        {
            id: 'business-plan',
            name: 'Business Plan',
            description: 'Comprehensive business overview and strategy',
            industry: 'General',
            thumbnail: '📊',
            slideCount: 15,
            features: ['Executive Summary', 'Market Analysis', 'Operations Plan', 'Financial Plan']
        },
        {
            id: 'product-launch',
            name: 'Product Launch',
            description: 'Introduce your new product to the market',
            industry: 'Product',
            thumbnail: '🎯',
            slideCount: 10,
            features: ['Product Overview', 'Target Audience', 'Go-to-Market', 'Success Metrics']
        },
        {
            id: 'investor-update',
            name: 'Investor Update',
            description: 'Regular updates for your investors',
            industry: 'Finance',
            thumbnail: '📈',
            slideCount: 8,
            features: ['Key Metrics', 'Progress Update', 'Challenges', 'Next Steps']
        },
        {
            id: 'sales-deck',
            name: 'Sales Deck',
            description: 'Convert prospects into customers',
            industry: 'Sales',
            thumbnail: '💼',
            slideCount: 9,
            features: ['Value Proposition', 'Case Studies', 'Pricing', 'Next Steps']
        },
        {
            id: 'company-overview',
            name: 'Company Overview',
            description: 'Introduce your company to stakeholders',
            industry: 'Corporate',
            thumbnail: '🏢',
            slideCount: 11,
            features: ['Company Story', 'Team', 'Services', 'Achievements']
        }
    ];

    const handleTemplateSelect = (template: Template) => {
        setSelectedTemplate(template);
        setShowCreateForm(true);
    };

    const handleCreatePitchDeck = () => {
        if (selectedTemplate && title.trim() && onSelectTemplate) {
            onSelectTemplate(selectedTemplate, title.trim(), description.trim() || undefined);
        }
    };

    const handleBack = () => {
        setShowCreateForm(false);
        setSelectedTemplate(null);
        setTitle('');
        setDescription('');
    };

    if (showCreateForm && selectedTemplate) {
        return (
            <div className={`space-y-6 ${className}`}>
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleBack}
                        className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                    >
                        ← Back
                    </button>
                    <div>
                        <h2 className="text-xl font-semibold text-white">Create Your Pitch Deck</h2>
                        <p className="text-blue-200">Using {selectedTemplate.name} template</p>
                    </div>
                </div>

                {/* Selected Template Preview */}
                <div className="bg-white bg-opacity-10 rounded-lg p-4 border border-white border-opacity-20">
                    <div className="flex items-center space-x-4">
                        <div className="text-4xl">{selectedTemplate.thumbnail}</div>
                        <div>
                            <h3 className="text-lg font-medium text-white">{selectedTemplate.name}</h3>
                            <p className="text-blue-200 text-sm">{selectedTemplate.description}</p>
                            <p className="text-gray-400 text-xs mt-1">
                                {selectedTemplate.slideCount} slides • {selectedTemplate.industry}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
                            Pitch Deck Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter your pitch deck title..."
                            className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                            Description (Optional)
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of your pitch deck..."
                            rows={3}
                            className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            disabled={loading}
                        />
                    </div>

                    <button
                        onClick={handleCreatePitchDeck}
                        disabled={!title.trim() || loading}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {loading ? 'Creating...' : 'Create Pitch Deck'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header */}
            <div className="text-center">
                <h2 className="text-2xl font-semibold text-white mb-2">Choose Your Template</h2>
                <p className="text-blue-200">
                    Select a professionally designed template to get started quickly
                </p>
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                    <div
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-6 border border-white border-opacity-20 hover:bg-opacity-20 cursor-pointer transition-all duration-200 group"
                    >
                        {/* Template Preview */}
                        <div className="text-center mb-4">
                            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                                {template.thumbnail}
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                {template.name}
                            </h3>
                            <p className="text-blue-200 text-sm mb-3">
                                {template.description}
                            </p>
                            <div className="flex justify-center space-x-4 text-xs text-gray-400">
                                <span>{template.slideCount} slides</span>
                                <span>•</span>
                                <span>{template.industry}</span>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-white">Includes:</p>
                            <ul className="space-y-1">
                                {template.features.slice(0, 3).map((feature, index) => (
                                    <li key={index} className="text-xs text-blue-200 flex items-center">
                                        <span className="w-1 h-1 bg-blue-400 rounded-full mr-2"></span>
                                        {feature}
                                    </li>
                                ))}
                                {template.features.length > 3 && (
                                    <li className="text-xs text-gray-400">
                                        +{template.features.length - 3} more sections
                                    </li>
                                )}
                            </ul>
                        </div>

                        {/* Use Template Button */}
                        <button className="w-full mt-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors group-hover:bg-blue-700">
                            Use This Template
                        </button>
                    </div>
                ))}
            </div>

            {/* Custom Template Option */}
            <div className="text-center pt-6 border-t border-white border-opacity-20">
                <p className="text-blue-200 mb-4">Need something different?</p>
                <button className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                    Start with Blank Template
                </button>
            </div>
        </div>
    );
};

export default TemplateSelector;
