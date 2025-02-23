// src/components/conversations/ConversationsLoading.tsx
import { Card } from '@/components/ui/Card';

export function ConversationsLoading() {
    return (
        <Card className="p-4">
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                        <div className="flex justify-between items-start">
                            <div className="space-y-3 w-full">
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </div>
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}