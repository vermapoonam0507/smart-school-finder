import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const AccordionItem = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-200">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-5 text-left font-semibold text-gray-800 hover:bg-gray-100"
            >
                <span>{title}</span>
                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {isOpen && <div className="p-5 bg-gray-50">{children}</div>}
        </div>
    );
};

export default AccordionItem;