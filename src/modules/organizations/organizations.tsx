import { useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, CardFooter, Spinner, Button, Input, Divider } from '@nextui-org/react';
import { PlusOutlined, TeamOutlined, SearchOutlined } from '@ant-design/icons';
import useOrganizations from './hook/useOrganizations';
import useAuth from '../auth/hooks/useAuth';

// Define the Organization type based on the API response
interface Organization {
    id: string;
    name: string;
    description: string;
    slug: string;
    open: boolean;
    created_at: string;
    user_id: string;
    is_creator?: boolean;
    is_member?: boolean;
}

export default function Organizations() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { data: organizations, isLoading, error } = useOrganizations(user?.id);
    const [searchTerm, setSearchTerm] = useState('');

    // Filter organizations based on search term
    const filteredOrganizations = organizations?.filter((org: Organization) =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Handle card click to navigate to organization home
    const handleCardClick = (organizationSlug: string) => {
        navigate(`/${organizationSlug}/home`);
    };

    // Handle create new organization
    const handleCreateOrganization = () => {
        navigate('/org/new');
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-120px)]">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-[calc(100vh-120px)]">
                <p className="text-danger text-lg">Error loading organizations</p>
                <Button color="primary" className="mt-4" onClick={() => window.location.reload()}>
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <section className="py-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-semibold">Your Organizations</h1>
                <Button color="primary" startContent={<PlusOutlined />} onClick={handleCreateOrganization}>
                    Create Organization
                </Button>
            </div>

            <div className="mb-6 max-w-md">
                <Input
                    placeholder="Search organizations..."
                    value={searchTerm}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    startContent={<SearchOutlined className="text-gray-400" />}
                    isClearable
                />
            </div>

            {filteredOrganizations?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed rounded-lg">
                    <TeamOutlined style={{ fontSize: '48px', color: '#888' }} />
                    <p className="mt-4 text-lg text-gray-600">
                        {searchTerm ? 'No organizations found matching your search' : 'No organizations found'}
                    </p>
                    {searchTerm ? (
                        <Button color="primary" variant="light" onClick={() => setSearchTerm('')} className="mt-2">
                            Clear Search
                        </Button>
                    ) : (
                        <Button color="primary" className="mt-4" onClick={handleCreateOrganization}>
                            Create Your First Organization
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOrganizations?.map((org: Organization) => (
                        <Card
                            key={org.id}
                            isPressable
                            isHoverable
                            onClick={() => handleCardClick(org.slug)}
                            className="border-2 hover:border-primary transition-all duration-200"
                        >
                            <CardBody className="p-5">
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary/10 p-3 rounded-full">
                                        <TeamOutlined
                                            style={{ fontSize: '24px', color: 'var(--nextui-colors-primary)' }}
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-medium">{org.name}</h3>
                                        {org.is_creator && (
                                            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                                                Creator
                                            </span>
                                        )}
                                        {org.is_member && !org.is_creator && (
                                            <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full">
                                                Member
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {org.description && (
                                    <>
                                        <Divider className="my-3" />
                                        <p className="text-sm text-gray-600 line-clamp-2">{org.description}</p>
                                    </>
                                )}
                            </CardBody>
                            <CardFooter className="bg-default-50 border-t-1 p-3">
                                <p className="text-xs text-gray-500">Click to view organization</p>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </section>
    );
}
