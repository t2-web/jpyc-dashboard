
import React, { useState } from 'react';
import Card from '../components/Card';
import { TUTORIALS } from '../constants';
import { ChevronDownIcon } from '../components/icons';

const AccordionItem: React.FC<{
  item: { heading: string; text: string; imageUrl?: string };
  isOpen: boolean;
  onClick: () => void;
}> = ({ item, isOpen, onClick }) => {
  return (
    <div className="border-b border-border">
      <button
        onClick={onClick}
        className="w-full flex justify-between items-center p-4 text-left"
      >
        <h4 className="font-semibold text-on-surface">{item.heading}</h4>
        <ChevronDownIcon />
      </button>
      {isOpen && (
        <div className="p-4 bg-background rounded-b-lg">
          <p className="text-on-surface-secondary mb-4">{item.text}</p>
          {item.imageUrl && (
            <img src={item.imageUrl} alt={item.heading} className="rounded-lg w-full object-cover" />
          )}
        </div>
      )}
    </div>
  );
};

const Tutorials: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<{ [key: string]: number | null }>({});

  const toggleAccordion = (sectionTitle: string, index: number) => {
    setOpenIndex(prev => ({
      ...prev,
      [sectionTitle]: prev[sectionTitle] === index ? null : index
    }));
  };

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-on-surface mb-2">はじめてのガイド</h1>
        <p className="text-on-surface-secondary">JPYC や DeFi を始める手順をステップ形式で学べます。</p>
      </section>

      {TUTORIALS.map(section => (
        <Card key={section.title}>
          <h2 className="text-2xl font-bold mb-4 text-primary">{section.title}</h2>
          <div className="border border-border rounded-lg">
            {section.content.map((item, index) => (
              <AccordionItem
                key={index}
                item={item}
                isOpen={openIndex[section.title] === index}
                onClick={() => toggleAccordion(section.title, index)}
              />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default Tutorials;
