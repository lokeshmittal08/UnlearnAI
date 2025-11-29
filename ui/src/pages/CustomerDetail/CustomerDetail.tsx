import { useParams } from 'react-router-dom';

export const CustomerDetail = () => {
    const { id } = useParams<{ id: string }>();

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">
                Customer Details
            </h1>
            <p className="text-gray-600 mb-8">
                Viewing customer: {id}
            </p>

            <div>
                <p>Customer detail content will be implemented here...</p>
            </div>
        </div>
    );
};