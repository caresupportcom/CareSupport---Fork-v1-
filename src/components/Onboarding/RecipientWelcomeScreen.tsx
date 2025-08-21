import React from 'react';
import { UserIcon, ShieldIcon, CheckIcon } from 'lucide-react';
import { Button } from '../Common/Button';
import { BracketText } from '../Common/BracketText';
interface RecipientWelcomeScreenProps {
  onNext: () => void;
  animateOut: boolean;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setPhone: (phone: string) => void;
  name: string;
  email: string;
  phone: string;
}
export const RecipientWelcomeScreen: React.FC<RecipientWelcomeScreenProps> = ({
  onNext,
  animateOut,
  setName,
  setEmail,
  setPhone,
  name,
  email,
  phone
}) => {
  return <div className={`space-y-6 transition-opacity duration-300 ${animateOut ? 'opacity-0' : 'opacity-100'}`}>
      <div className="flex justify-center">
        <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center mb-6">
          <UserIcon className="w-16 h-16 text-blue-500" />
        </div>
      </div>
      <h1 className="text-3xl font-bold text-center mb-2">
        Welcome to Your Care Command Center
      </h1>
      <p className="text-center text-gray-600 mb-6">
        CareSupport is designed to put you in control of your care team and
        daily needs.
      </p>
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <BracketText active={true} className="mb-1 text-blue-800 font-medium">
          You're in charge
        </BracketText>
        <p className="text-sm text-blue-700">
          This is your tool to build your team, communicate your needs, and
          maintain your independence.
        </p>
      </div>
      <div className="space-y-4 mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
            <CheckIcon className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-gray-700">Build and manage your care team</p>
        </div>
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
            <CheckIcon className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-gray-700">
            Communicate needs with just your voice
          </p>
        </div>
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
            <CheckIcon className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-gray-700">
            Maintain privacy and control your information
          </p>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Your name
          </label>
          <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Enter your full name" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email address
          </label>
          <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Enter your email address" />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone number
          </label>
          <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Enter your phone number" />
        </div>
      </div>
      <Button onClick={onNext} className="w-full mt-6" disabled={!name || !email || !phone}>
        Let's Build Your Team
      </Button>
    </div>;
};