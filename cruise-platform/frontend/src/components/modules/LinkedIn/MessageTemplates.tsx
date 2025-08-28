import React from 'react';

// LinkedIn functionality commented out as requested
// Will be implemented when LinkedIn integration is required

const MessageTemplates: React.FC = () => {
    /*
    const templates = [
        {
            id: 1,
            subject: "Let's Connect!",
            body: "Hi [Name],\n\nI came across your profile and would love to connect. I believe we have mutual interests in [Industry/Field]. Looking forward to connecting!\n\nBest,\n[Your Name]"
        },
        {
            id: 2,
            subject: "Collaboration Opportunity",
            body: "Hello [Name],\n\nI hope this message finds you well. I am reaching out to explore potential collaboration opportunities between our companies. Would you be open to a brief chat?\n\nBest regards,\n[Your Name]"
        },
        {
            id: 3,
            subject: "Quick Question",
            body: "Hi [Name],\n\nI have a quick question regarding [Topic]. I would appreciate your insights. Can we schedule a time to chat?\n\nThank you!\n[Your Name]"
        }
    ];
    */

    return (
        <div className="message-templates p-8 text-center">
            <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">💬</div>
                <h2 className="text-2xl font-bold text-white mb-4">Message Templates Coming Soon</h2>
                <p className="text-gray-400 mb-6">
                    LinkedIn message template features are currently under development.
                    This functionality will be available in a future update.
                </p>
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Planned Features:</h3>
                    <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Pre-built message templates</li>
                        <li>• Custom template creation</li>
                        <li>• Variable placeholders</li>
                        <li>• Template categories</li>
                        <li>• A/B testing capabilities</li>
                    </ul>
                </div>
            </div>
            {/*
            <ul>
                {templates.map(template => (
                    <li key={template.id}>
                        <h3>{template.subject}</h3>
                        <p>{template.body}</p>
                    </li>
                ))}
            </ul>
            */}
        </div>
    );
};

export default MessageTemplates;