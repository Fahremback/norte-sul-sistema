import React from 'react';
import Modal from '../common/Modal';

// Icons (simple placeholders, can be replaced with actual SVG components)
const WrenchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2 text-blue-500"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.472-2.472a3.375 3.375 0 00-4.773-4.773L6.75 11.42m5.877 5.877l-5.877-5.877m0 0a3.375 3.375 0 00-4.773 4.773l2.472 2.472" /></svg>;
const HeadsetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2 text-purple-500"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>;
const ShoppingCartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2 text-orange-500"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>;


export type AddChoiceOption = 'maintenance' | 'support' | 'purchase';

interface AddChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChoiceSelected: (choice: AddChoiceOption) => void;
}

const AddChoiceModal: React.FC<AddChoiceModalProps> = ({ isOpen, onClose, onChoiceSelected }) => {
  if (!isOpen) return null;

  const choices: { type: AddChoiceOption; label: string; icon: React.ReactNode; description: string; color: string }[] = [
    { type: 'maintenance', label: 'Serviço de Manutenção', icon: <WrenchIcon />, description: 'Registrar um item para reparo ou serviço técnico.', color: 'blue' },
    { type: 'support', label: 'Atendimento ao Cliente', icon: <HeadsetIcon />, description: 'Registrar um novo ticket de atendimento ou dúvida do cliente.', color: 'purple' },
    { type: 'purchase', label: 'Requisição de Compra', icon: <ShoppingCartIcon />, description: 'Criar uma lista de itens a serem comprados.', color: 'orange' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="O que você gostaria de adicionar?" size="2xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
        {choices.map((choice) => (
          <button
            key={choice.type}
            onClick={() => onChoiceSelected(choice.type)}
            className={`flex flex-col items-center justify-center p-6 bg-white border-2 border-transparent rounded-lg shadow-lg hover:shadow-xl hover:border-${choice.color}-500 transition-all duration-200 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-${choice.color}-500 focus:ring-opacity-50`}
            aria-label={choice.label}
          >
            {choice.icon}
            <h3 className={`text-lg font-semibold text-${choice.color}-600 mb-1`}>{choice.label}</h3>
            <p className="text-sm text-gray-600 text-center">{choice.description}</p>
          </button>
        ))}
      </div>
    </Modal>
  );
};

export default AddChoiceModal;
