// src/app/dashboard/[projectId]/page.tsx
import DashboardLayout from '@/components/dashboard/DashboardLayout';

interface Props {
    params: {
        projectId: string;
    };
}

export default function ProjectDashboardPage({ params }: Props) {
    return <DashboardLayout projectId={params.projectId} />;
}