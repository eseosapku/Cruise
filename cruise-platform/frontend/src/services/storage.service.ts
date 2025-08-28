import { useEffect, useState } from 'react';

const STORAGE_KEY = 'cruisePlatformData';

const useStorage = () => {
    const [data, setData] = useState(() => {
        const savedData = localStorage.getItem(STORAGE_KEY);
        return savedData ? JSON.parse(savedData) : null;
    });

    useEffect(() => {
        if (data) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [data]);

    const clearStorage = () => {
        setData(null);
    };

    return {
        data,
        setData,
        clearStorage,
    };
};

export default useStorage;