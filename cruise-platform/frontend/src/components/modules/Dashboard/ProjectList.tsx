import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pitchDeckService } from '../../../services/pitchdeck.service';

interface Project {
    id: string;
    title: string;
    description?: string;
    type: 'pitch-deck' | 'campaign' | 'analysis';
    status: 'draft' | 'in-progress' | 'completed';
    lastModified: Date;
    createdAt: Date;
}

interface ProjectListProps {
    maxItems?: number;
    showCreateButton?: boolean;
    className?: string;
}

const ProjectList: React.FC<ProjectListProps> = ({
    maxItems = 10,
    showCreateButton = true,
    className = ''
}) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setLoading(true);
            // Load pitch decks (main project type)
            const pitchDecks = await pitchDeckService.getPitchDecks();

            const projectData: Project[] = pitchDecks.map((deck: any) => ({
                id: deck.id,
                title: deck.title,
                description: deck.description,
                type: 'pitch-deck' as const,
                status: deck.status || 'draft',
                lastModified: new Date(deck.updatedAt || deck.updated_at),
                createdAt: new Date(deck.createdAt || deck.created_at)
            }));

            setProjects(projectData.slice(0, maxItems));
        } catch (err: any) {
            console.error('Failed to load projects:', err);
            setError('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    const getProjectIcon = (type: string) => {
        switch (type) {
            case 'pitch-deck': return '📊';
            case 'campaign': return '📧';
            case 'analysis': return '🔍';
            default: return '📝';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-500';
            case 'in-progress': return 'bg-yellow-500';
            case 'draft': return 'bg-gray-500';
            default: return 'bg-blue-500';
        }
    };

    const handleCreateProject = () => {
        navigate('/pitch-deck');
    };

    const handleProjectClick = (project: Project) => {
        if (project.type === 'pitch-deck') {
            navigate(`/pitch-deck/${project.id}`);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-300 mb-4">{error}</p>
                <button
                    onClick={loadProjects}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Recent Projects</h3>
                {showCreateButton && (
                    <button
                        onClick={handleCreateProject}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        New Project
                    </button>
                )}
            </div>

            {/* Project List */}
            {projects.length === 0 ? (
                <div className="text-center py-8">
                    <div className="text-4xl mb-4">📝</div>
                    <p className="text-gray-400 mb-4">No projects yet</p>
                    {showCreateButton && (
                        <button
                            onClick={handleCreateProject}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Create Your First Project
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            onClick={() => handleProjectClick(project)}
                            className="p-4 bg-white bg-opacity-10 backdrop-blur-md rounded-lg border border-white border-opacity-20 hover:bg-opacity-20 cursor-pointer transition-all duration-200"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 flex-1">
                                    <div className="text-2xl">
                                        {getProjectIcon(project.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white font-medium truncate">
                                            {project.title}
                                        </h4>
                                        {project.description && (
                                            <p className="text-gray-300 text-sm truncate">
                                                {project.description}
                                            </p>
                                        )}
                                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                                            <span>Type: {project.type}</span>
                                            <span>Modified: {project.lastModified.toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <span className={`w-3 h-3 ${getStatusColor(project.status)} rounded-full`}></span>
                                    <span className="text-xs text-gray-400 capitalize">
                                        {project.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* View All Link */}
            {projects.length >= maxItems && (
                <div className="text-center pt-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-blue-300 hover:text-white text-sm underline"
                    >
                        View all projects
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProjectList;