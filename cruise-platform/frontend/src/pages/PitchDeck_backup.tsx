import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pitchDeckService, PitchDeckRequest, CompletePitchDeck } from '../services/pitchdeck.service';
import SlideEditor from '../components/modules/PitchDeck/SlideEditor';
import TemplateSelector from '../components/modules/PitchDeck/TemplateSelector';
import PresentationView from '../components/modules/PitchDeck/PresentationView';
import Loading from '../components/common/Loading';

interface PitchDeckData {
    id: string;
    title: string;
    description?: string;
    slides: any[];
    template?: string;
    createdAt: Date;
    updatedAt: Date;
}

interface GensparkFormData {
    companyName: string;
    industry: string;
    targetAudience: string;
    fundingStage: string;
    businessType: string;
    companyDescription: string;
    problemStatement: string;
    solution: string;
    marketSize: string;
    competitiveAdvantage: string;
    revenueModel: string;
    fundingAmount: string;
    useOfFunds: string;
    teamSize: string;
    currentRevenue: string;
    specificTopics: string[];
    researchDepth: 'basic' | 'comprehensive' | 'expert';
    theme: 'modern' | 'corporate' | 'startup' | 'creative';
    slideAspectRatio: '16:9' | '4:3' | 'widescreen';
}

const PitchDeck: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [pitchDeck, setPitchDeck] = useState<PitchDeckData | null>(null);
    const [gensparkData, setGensparkData] = useState<CompletePitchDeck | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [currentView, setCurrentView] = useState<'form' | 'template' | 'editor' | 'presentation'>('form');
    const [formData, setFormData] = useState<GensparkFormData>({
        companyName: '',
        industry: 'technology',
        targetAudience: 'investors',
        fundingStage: 'seed',
        businessType: 'saas',
        companyDescription: '',
        problemStatement: '',
        solution: '',
        marketSize: '',
        competitiveAdvantage: '',
        revenueModel: '',
        fundingAmount: '',
        useOfFunds: '',
        teamSize: '',
        currentRevenue: '',
        specificTopics: [],
        researchDepth: 'comprehensive',
        theme: 'modern',
        slideAspectRatio: '16:9'
    });

    useEffect(() => {
        if (id) {
            loadPitchDeck(id);
        } else {
            // New pitch deck - start with form
            setCurrentView('form');
        }
    }, [id]);

    const loadPitchDeck = async (pitchDeckId: string) => {
        try {
            setLoading(true);
            const response = await pitchDeckService.getPitchDeck(pitchDeckId);
            setPitchDeck(response);
            setCurrentView('editor');
        } catch (err: any) {
            console.error('Failed to load pitch deck:', err);
            setError('Failed to load pitch deck');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateGensparkPitchDeck = async () => {
        if (!formData.companyName.trim()) {
            setError('Company name is required');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const request: PitchDeckRequest = {
                companyName: formData.companyName,
                industry: formData.industry,
                targetAudience: formData.targetAudience,
                fundingStage: formData.fundingStage,
                businessType: formData.businessType,
                specificTopics: formData.specificTopics,
                researchDepth: formData.researchDepth,
                theme: formData.theme,
                slideAspectRatio: formData.slideAspectRatio
            };

            const result = await pitchDeckService.generateGensparkPitchDeck(request);
            setGensparkData(result);
            setCurrentView('presentation');
        } catch (err: any) {
            console.error('Failed to generate Genspark pitch deck:', err);
            setError('Failed to generate pitch deck. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePitchDeck = async (template: any, title: string, description?: string) => {
        try {
            setLoading(true);
            const response = await pitchDeckService.createPitchDeck({
                title,
                description,
                template: template.id || template
            });
            setPitchDeck(response);
            setCurrentView('editor');
            if (response.id) {
                navigate(`/pitch-deck/${response.id}`);
            }
        } catch (err: any) {
            console.error('Failed to create pitch deck:', err);
            setError('Failed to create pitch deck');
        } finally {
            setLoading(false);
        }
    };

    const convertGensparkToSlides = (gensparkData: CompletePitchDeck) => {
        if (!gensparkData.slides) return [];

        return gensparkData.slides.map((slide: any, index: number) => ({
            id: `slide-${index}`,
            type: 'content' as const,
            title: slide.title || slide.layoutId || `Slide ${index + 1}`,
            content: slide.htmlContent || slide.content || '',
            layout: slide.layoutId || 'default',
            order: index
        }));
    };

    const handleSavePitchDeck = async (updatedPitchDeck: Partial<PitchDeckData>) => {
        if (!pitchDeck) return;

        try {
            setLoading(true);
            const response = await pitchDeckService.updatePitchDeck(pitchDeck.id, updatedPitchDeck);
            setPitchDeck(response);
        } catch (err: any) {
            console.error('Failed to save pitch deck:', err);
            setError('Failed to save pitch deck');
        } finally {
            setLoading(false);
        }
    };

    const updateFormData = (field: keyof GensparkFormData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (loading && !pitchDeck && !gensparkData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loading size="large" message="Loading pitch deck..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-animated p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="glassmorphism rounded-2xl p-8 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-3 gradient-text">
                                {gensparkData ? `🚀 ${formData.companyName} Pitch Deck` :
                                    pitchDeck ? `📊 ${pitchDeck.title}` : '🎯 AI-Powered Pitch Deck Generator'}
                            </h1>
                            <p className="text-blue-200 text-lg">
                                {gensparkData ? 'Professional AI-generated presentation with Genspark workflow' :
                                    pitchDeck ? 'Edit your presentation and slides' :
                                        'Create stunning pitch decks with AI-powered design and content generation'}
                            </p>
                        </div>

                        <div className="flex space-x-2">
                            {!gensparkData && !pitchDeck && (
                                <>
                                    <button
                                        onClick={() => setCurrentView('form')}
                                        className={`px-4 py-2 rounded-lg transition-colors ${currentView === 'form'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                                            }`}
                                    >
                                        AI Generate
                                    </button>
                                    <button
                                        onClick={() => setCurrentView('template')}
                                        className={`px-4 py-2 rounded-lg transition-colors ${currentView === 'template'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                                            }`}
                                    >
                                        Templates
                                    </button>
                                </>
                            )}

                            {(pitchDeck || gensparkData) && (
                                <>
                                    <button
                                        onClick={() => setCurrentView('editor')}
                                        className={`px-4 py-2 rounded-lg transition-colors ${currentView === 'editor'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                                            }`}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => setCurrentView('presentation')}
                                        className={`px-4 py-2 rounded-lg transition-colors ${currentView === 'presentation'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                                            }`}
                                    >
                                        Present
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4 mb-6">
                        <p className="text-red-200">{error}</p>
                        <button
                            onClick={() => setError('')}
                            className="mt-2 text-red-200 hover:text-white underline"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Main Content */}
                <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 min-h-[600px]">
                    {currentView === 'form' && (
                        <GensparkForm
                            formData={formData}
                            updateFormData={updateFormData}
                            onGenerate={handleGenerateGensparkPitchDeck}
                            loading={loading}
                        />
                    )}

                    {currentView === 'template' && (
                        <TemplateSelector onSelectTemplate={handleCreatePitchDeck} />
                    )}

                    {currentView === 'editor' && (
                        <SlideEditor
                            slides={gensparkData ? convertGensparkToSlides(gensparkData) : (pitchDeck?.slides || [])}
                            onSaveSlide={(slide) => console.log('Save slide:', slide)}
                            loading={loading}
                        />
                    )}

                    {currentView === 'presentation' && (
                        <PresentationView
                            slides={gensparkData ? convertGensparkToSlides(gensparkData) : (pitchDeck?.slides || [])}
                            showControls={true}
                        />
                    )}

                    {loading && (
                        <div className="flex justify-center mt-6">
                            <Loading size="small" message="Generating AI-powered pitch deck..." />
                        </div>
                    )}
                </div>

                {/* Feature Cards */}
                {!pitchDeck && !gensparkData && (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 text-center">
                            <div className="text-3xl mb-3">🤖</div>
                            <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Generation</h3>
                            <p className="text-blue-200 text-sm">
                                Advanced AI creates content, layout, and design based on your company information
                            </p>
                        </div>

                        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 text-center">
                            <div className="text-3xl mb-3">🎨</div>
                            <h3 className="text-lg font-semibold text-white mb-2">Professional Design</h3>
                            <p className="text-blue-200 text-sm">
                                Genspark-style layouts with modern design tokens and responsive layouts
                            </p>
                        </div>

                        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 text-center">
                            <div className="text-3xl mb-3">📊</div>
                            <h3 className="text-lg font-semibold text-white mb-2">Data-Driven Content</h3>
                            <p className="text-blue-200 text-sm">
                                Real research data, market insights, and visual elements automatically integrated
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// GensparkForm Component
interface GensparkFormProps {
    formData: GensparkFormData;
    updateFormData: (field: keyof GensparkFormData, value: any) => void;
    onGenerate: () => void;
    loading: boolean;
}

const GensparkForm: React.FC<GensparkFormProps> = ({ formData, updateFormData, onGenerate, loading }) => {
    const addTopic = () => {
        const newTopic = (document.getElementById('newTopic') as HTMLInputElement)?.value.trim();
        if (newTopic && !formData.specificTopics.includes(newTopic)) {
            updateFormData('specificTopics', [...formData.specificTopics, newTopic]);
            (document.getElementById('newTopic') as HTMLInputElement).value = '';
        }
    };

    const removeTopic = (index: number) => {
        const newTopics = formData.specificTopics.filter((_, i) => i !== index);
        updateFormData('specificTopics', newTopics);
    };

    return (
        <div className="space-y-8">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-6 gradient-text flex items-center justify-center">
                    <span className="mr-4 text-5xl">🤖</span>
                    AI Pitch Deck Generator
                </h2>
                <p className="text-blue-200 text-xl max-w-3xl mx-auto leading-relaxed">
                    Create a professional pitch deck using advanced AI technology and comprehensive market research.
                    Our intelligent system will analyze your business and generate compelling presentations.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Company Information */}
                <div className="glassmorphism rounded-3xl p-8 space-y-8 shadow-xl border border-white border-opacity-20">
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-white flex items-center justify-center mb-4">
                            <span className="mr-3 text-3xl">🏢</span>
                            Company Information
                        </h3>
                        <p className="text-blue-200">Tell us about your company to generate tailored content</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-white text-lg font-semibold mb-4 flex items-center">
                                <span className="mr-2">✨</span>
                                Company Name *
                            </label>
                            <input
                                type="text"
                                value={formData.companyName}
                                onChange={(e) => updateFormData('companyName', e.target.value)}
                                className="w-full px-6 py-4 bg-white bg-opacity-15 backdrop-blur-md border border-white border-opacity-30 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-lg shadow-lg"
                                placeholder="Enter your company name"
                            />
                        </div>

                        <div>
                            <label className="block text-white text-lg font-semibold mb-4 flex items-center">
                                <span className="mr-2">🏭</span>
                                Industry
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.industry}
                                    onChange={(e) => updateFormData('industry', e.target.value)}
                                    className="w-full px-6 py-4 bg-white bg-opacity-15 backdrop-blur-md border border-white border-opacity-30 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-lg shadow-lg appearance-none"
                                >
                                    <option value="technology" className="bg-gray-900 text-white">🔧 Technology</option>
                                    <option value="healthcare" className="bg-gray-900 text-white">🏥 Healthcare</option>
                                    <option value="finance" className="bg-gray-900 text-white">💰 Finance</option>
                                    <option value="retail" className="bg-gray-900 text-white">🛍️ Retail</option>
                                    <option value="manufacturing" className="bg-gray-900 text-white">🏭 Manufacturing</option>
                                    <option value="education" className="bg-gray-900 text-white">📚 Education</option>
                                    <option value="real-estate" className="bg-gray-900 text-white">🏠 Real Estate</option>
                                    <option value="other" className="bg-gray-900 text-white">🔧 Other</option>
                                </select>
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-white text-lg font-semibold mb-4 flex items-center">
                                <span className="mr-2">�</span>
                                Company Description *
                            </label>
                            <textarea
                                value={formData.companyDescription}
                                onChange={(e) => updateFormData('companyDescription', e.target.value)}
                                className="w-full px-6 py-4 bg-white bg-opacity-15 backdrop-blur-md border border-white border-opacity-30 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-lg shadow-lg resize-vertical min-h-[120px]"
                                placeholder="Briefly describe what your company does and its mission"
                                rows={4}
                            />
                        </div>

                        <div>
                            <label className="block text-white text-lg font-semibold mb-4 flex items-center">
                                <span className="mr-2">⚠️</span>
                                Problem Statement
                            </label>
                            <textarea
                                value={formData.problemStatement}
                                onChange={(e) => updateFormData('problemStatement', e.target.value)}
                                className="w-full px-6 py-4 bg-white bg-opacity-15 backdrop-blur-md border border-white border-opacity-30 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-lg shadow-lg resize-vertical min-h-[100px]"
                                placeholder="What problem does your company solve?"
                                rows={3}
                            />
                        </div>

                        <div>
                            <label className="block text-white text-lg font-semibold mb-4 flex items-center">
                                <span className="mr-2">�</span>
                                Solution
                            </label>
                            <textarea
                                value={formData.solution}
                                onChange={(e) => updateFormData('solution', e.target.value)}
                                className="w-full px-6 py-4 bg-white bg-opacity-15 backdrop-blur-md border border-white border-opacity-30 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-lg shadow-lg resize-vertical min-h-[100px]"
                                placeholder="How does your company solve this problem?"
                                rows={3}
                            />
                        </div>
                    </div>
                </div>

                {/* Presentation Settings */}
                <div className="glassmorphism rounded-3xl p-8 space-y-8 shadow-xl border border-white border-opacity-20">
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-white flex items-center justify-center mb-4">
                            <span className="mr-3 text-3xl">🎯</span>
                            Presentation Settings
                        </h3>
                        <p className="text-blue-200">Customize your presentation for maximum impact</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-white text-lg font-semibold mb-4 flex items-center">
                                <span className="mr-2">👥</span>
                                Target Audience
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.targetAudience}
                                    onChange={(e) => updateFormData('targetAudience', e.target.value)}
                                    className="w-full px-6 py-4 bg-white bg-opacity-15 backdrop-blur-md border border-white border-opacity-30 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-lg shadow-lg appearance-none"
                                >
                                    <option value="investors" className="bg-gray-900 text-white">💰 Investors</option>
                                    <option value="customers" className="bg-gray-900 text-white">👥 Customers</option>
                                    <option value="partners" className="bg-gray-900 text-white">🤝 Partners</option>
                                    <option value="employees" className="bg-gray-900 text-white">👨‍💼 Employees</option>
                                    <option value="board" className="bg-gray-900 text-white">🏛️ Board Members</option>
                                </select>
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-white text-lg font-semibold mb-4 flex items-center">
                                <span className="mr-2">🌱</span>
                                Funding Stage
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.fundingStage}
                                    onChange={(e) => updateFormData('fundingStage', e.target.value)}
                                    className="w-full px-6 py-4 bg-white bg-opacity-15 backdrop-blur-md border border-white border-opacity-30 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-lg shadow-lg appearance-none"
                                >
                                    <option value="pre-seed" className="bg-gray-900 text-white">🌱 Pre-Seed</option>
                                    <option value="seed" className="bg-gray-900 text-white">🌿 Seed</option>
                                    <option value="series-a" className="bg-gray-900 text-white">🌳 Series A</option>
                                    <option value="series-b" className="bg-gray-900 text-white">🌲 Series B</option>
                                    <option value="series-c" className="bg-gray-900 text-white">🌴 Series C+</option>
                                    <option value="growth" className="bg-gray-900 text-white">📈 Growth</option>
                                    <option value="ipo" className="bg-gray-900 text-white">🏆 IPO</option>
                                </select>
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-white text-lg font-semibold mb-4 flex items-center">
                                <span className="mr-2">🎨</span>
                                Theme
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.theme}
                                    onChange={(e) => updateFormData('theme', e.target.value)}
                                    className="w-full px-6 py-4 bg-white bg-opacity-15 backdrop-blur-md border border-white border-opacity-30 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-lg shadow-lg appearance-none"
                                >
                                    <option value="modern" className="bg-gray-900 text-white">✨ Modern</option>
                                    <option value="corporate" className="bg-gray-900 text-white">🏢 Corporate</option>
                                    <option value="startup" className="bg-gray-900 text-white">🚀 Startup</option>
                                    <option value="creative" className="bg-gray-900 text-white">🎨 Creative</option>
                                </select>
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-white text-lg font-semibold mb-4 flex items-center">
                                <span className="mr-2">🔍</span>
                                Research Depth
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.researchDepth}
                                    onChange={(e) => updateFormData('researchDepth', e.target.value)}
                                    className="w-full px-6 py-4 bg-white bg-opacity-15 backdrop-blur-md border border-white border-opacity-30 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-lg shadow-lg appearance-none"
                                >
                                    <option value="basic" className="bg-gray-900 text-white">📝 Basic</option>
                                    <option value="comprehensive" className="bg-gray-900 text-white">📊 Comprehensive</option>
                                    <option value="expert" className="bg-gray-900 text-white">🎓 Expert</option>
                                </select>
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Specific Topics */}
            <div className="glassmorphism rounded-3xl p-8 shadow-xl border border-white border-opacity-20">
                <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center justify-center">
                        <span className="mr-3 text-3xl">🎯</span>
                        Specific Topics (Optional)
                    </h3>
                    <p className="text-blue-200">Add specific topics you want to focus on in your presentation</p>
                </div>

                <div className="flex gap-4 mb-6">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            id="newTopic"
                            placeholder="Add a specific topic to focus on..."
                            className="w-full px-6 py-4 bg-white bg-opacity-15 backdrop-blur-md border border-white border-opacity-30 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-lg shadow-lg"
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                            🏷️
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={addTopic}
                        className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                    >
                        <span>➕</span>
                        <span>Add</span>
                    </button>
                </div>

                {formData.specificTopics.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                        {formData.specificTopics.map((topic, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-full shadow-lg transform transition-all duration-300 hover:scale-105"
                            >
                                <span className="mr-2">🏷️</span>
                                {topic}
                                <button
                                    type="button"
                                    onClick={() => removeTopic(index)}
                                    className="ml-3 text-white hover:text-red-200 font-bold text-lg"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Generate Button */}
            <div className="text-center pt-10">
                <button
                    onClick={onGenerate}
                    disabled={loading || !formData.companyName.trim()}
                    className="group px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xl rounded-3xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl border border-white border-opacity-20"
                >
                    <div className="flex items-center space-x-4">
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                <span>Generating AI Pitch Deck...</span>
                                <span className="text-2xl">✨</span>
                            </>
                        ) : (
                            <>
                                <span className="text-2xl group-hover:animate-bounce">🚀</span>
                                <span>Generate AI Pitch Deck</span>
                                <span className="text-2xl group-hover:animate-bounce">✨</span>
                            </>
                        )}
                    </div>
                </button>
            </div>
        </div>
    );
};

export default PitchDeck;