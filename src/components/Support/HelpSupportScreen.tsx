import React, { useState } from 'react';
import { ArrowLeftIcon, HelpCircleIcon, MessageCircleIcon, BookOpenIcon, AlertTriangleIcon, UsersIcon, ChevronDownIcon, ChevronUpIcon, PhoneIcon, MailIcon, ExternalLinkIcon, SearchIcon, PlayIcon, FileTextIcon, InfoIcon } from 'lucide-react';
import { Button } from '../Common/Button';
import { BracketText } from '../Common/BracketText';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
type FAQItem = {
  question: string;
  answer: string;
  category: 'general' | 'account' | 'caregiving' | 'teams' | 'technical';
};
export const HelpSupportScreen = ({
  onBack
}) => {
  const [activeTab, setActiveTab] = useState('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQs, setExpandedFAQs] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [contactFormData, setContactFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const faqs: FAQItem[] = [{
    question: "What is CareSupport's Voice-to-Recommend™ feature?",
    answer: 'Voice-to-Recommend™ allows you to record care instructions using your voice. The app will transcribe your recording and create task recommendations that can be shared with your care team. To use this feature, tap the microphone button in the center of the bottom navigation bar.',
    category: 'general'
  }, {
    question: 'How do I create a care team?',
    answer: 'To create a care team, go to More > Manage Care Teams > Create New Team. You can then set a team name, add members, and assign roles. Once created, you can share an invite code with others to join your team.',
    category: 'teams'
  }, {
    question: 'Can I use CareSupport offline?',
    answer: 'Yes, CareSupport has offline functionality. You can view and create tasks even without an internet connection. The app will sync your changes once you\', re, back, online, .Look, for: the, "Offline Mode": indicator, when, you, lose, connection, .,',
    category: 'technical'
  }, {
    question: 'How do I reset my password?',
    answer: 'To reset your password, go to the login screen and tap "Forgot Password". Enter your email address, and we\'ll send you a password reset link. For security reasons, the link expires after 24 hours.',
    category: 'account'
  }, {
    question: 'How do I assign a task to someone else?',
    answer: 'To assign a task, open the task details and tap "Assign". Select a team member from the list or enter their email address if they\'re not yet part of your care team. They\'ll receive a notification about the assignment.',
    category: 'caregiving'
  }, {
    question: "What should I do if there's a conflict in the care schedule?",
    answer: "If you notice a conflict in the care schedule, tap on the task with the conflict indicator (⚠️). You'll see details about the conflict and options to resolve it, such as rescheduling or reassigning the task.",
    category: 'caregiving'
  }, {
    question: 'How do I change my notification settings?',
    answer: 'To change your notification settings, go to More > Notification Preferences. Here you can customize which notifications you receive, how you receive them (email, SMS, or in-app), and set quiet hours.',
    category: 'account'
  }, {
    question: 'Is my data secure?',
    answer: 'Yes, CareSupport takes data security seriously. All your data is encrypted both in transit and at rest. You can control your privacy settings at More > Privacy Settings to determine what information is shared and with whom.',
    category: 'technical'
  }, {
    question: 'How do I export my care data?',
    answer: "To export your data, go to More > Privacy Settings > Data Management > Export All My Data. You'll receive an email with a download link to a file containing all your care data in a standard format.",
    category: 'account'
  }, {
    question: 'Can I schedule recurring tasks?',
    answer: 'Yes, when creating a task, toggle the "Recurring" option and set the frequency (daily, weekly, monthly). You can also set an end date or number of occurrences for the recurring task.',
    category: 'caregiving'
  }];
  const tutorialGuides = [{
    title: 'Getting Started with CareSupport',
    description: 'Learn the basics of using CareSupport for care coordination',
    icon: <PlayIcon className="w-5 h-5 text-blue-500" />,
    type: 'video'
  }, {
    title: 'Creating Effective Care Teams',
    description: 'Best practices for organizing and managing care teams',
    icon: <FileTextIcon className="w-5 h-5 text-green-500" />,
    type: 'article'
  }, {
    title: 'Voice-to-Recommend™ Tutorial',
    description: 'Get the most out of voice recording features',
    icon: <PlayIcon className="w-5 h-5 text-blue-500" />,
    type: 'video'
  }, {
    title: 'Privacy & Security Guide',
    description: 'Understanding your data protection options',
    icon: <FileTextIcon className="w-5 h-5 text-green-500" />,
    type: 'article'
  }, {
    title: 'Offline Mode Explained',
    description: 'How to use CareSupport without an internet connection',
    icon: <PlayIcon className="w-5 h-5 text-blue-500" />,
    type: 'video'
  }];
  const troubleshootingItems = [{
    title: 'App is running slowly',
    steps: ['Close other apps running in the background', 'Restart the CareSupport app', 'Check for app updates', 'Restart your device']
  }, {
    title: 'Notifications not working',
    steps: ['Check your notification settings in the app', 'Verify device notification settings', 'Ensure you have an internet connection', 'Check if quiet hours are enabled']
  }, {
    title: 'Cannot join a care team',
    steps: ['Verify the invite code is correct', 'Check your internet connection', 'Ask the team admin to resend the invitation', 'Ensure you have the latest app version']
  }, {
    title: 'Voice recording not working',
    steps: ['Grant microphone permissions to the app', 'Check if your microphone is working with other apps', 'Move to a quieter environment', 'Restart the app and try again']
  }];
  const communityResources = [{
    title: 'CareSupport Community Forum',
    description: 'Connect with other caregivers and share experiences',
    icon: <UsersIcon className="w-5 h-5 text-purple-500" />
  }, {
    title: 'Monthly Webinars',
    description: 'Join our expert-led sessions on caregiving topics',
    icon: <PlayIcon className="w-5 h-5 text-blue-500" />
  }, {
    title: 'Regional Support Groups',
    description: 'Find in-person support in your area',
    icon: <MapPinIcon className="w-5 h-5 text-red-500" />
  }];
  const toggleFAQ = (index: number) => {
    setExpandedFAQs(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
    if (!expandedFAQs.includes(index)) {
      analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
        feature_name: 'faq_expanded',
        faq_question: faqs[index].question
      });
    }
  };
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'help_tab_changed',
      tab_name: tab
    });
  };
  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'faq_category_changed',
      category: category || 'all'
    });
  };
  const handleContactInputChange = (field: string, value: string) => {
    setContactFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the form data to a backend
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'contact_support_submitted'
    });
    alert('Your message has been sent. Our support team will respond shortly.');
    setContactFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };
  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = searchQuery ? faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    const matchesCategory = selectedCategory ? faq.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });
  return <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center bg-white border-b border-gray-200">
        <button onClick={onBack} className="mr-4" aria-label="Go back">
          <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold">Help & Support</h1>
      </div>
      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex overflow-x-auto px-6 py-2">
          <button className={`px-4 py-2 flex-shrink-0 border-b-2 font-medium text-sm ${activeTab === 'faq' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => handleTabChange('faq')}>
            <BracketText active={activeTab === 'faq'}>FAQs</BracketText>
          </button>
          <button className={`px-4 py-2 flex-shrink-0 border-b-2 font-medium text-sm ${activeTab === 'contact' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => handleTabChange('contact')}>
            <BracketText active={activeTab === 'contact'}>
              Contact Us
            </BracketText>
          </button>
          <button className={`px-4 py-2 flex-shrink-0 border-b-2 font-medium text-sm ${activeTab === 'guides' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => handleTabChange('guides')}>
            <BracketText active={activeTab === 'guides'}>Guides</BracketText>
          </button>
          <button className={`px-4 py-2 flex-shrink-0 border-b-2 font-medium text-sm ${activeTab === 'troubleshoot' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => handleTabChange('troubleshoot')}>
            <BracketText active={activeTab === 'troubleshoot'}>
              Troubleshooting
            </BracketText>
          </button>
          <button className={`px-4 py-2 flex-shrink-0 border-b-2 font-medium text-sm ${activeTab === 'community' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => handleTabChange('community')}>
            <BracketText active={activeTab === 'community'}>
              Community
            </BracketText>
          </button>
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* FAQs */}
        {activeTab === 'faq' && <div>
            <div className="mb-6">
              <div className="relative">
                <input type="text" placeholder="Search FAQs..." className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                <SearchIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div className="mb-6 overflow-x-auto">
              <div className="flex space-x-2 pb-2">
                <button className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${selectedCategory === null ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`} onClick={() => handleCategoryChange(null)}>
                  All
                </button>
                <button className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${selectedCategory === 'general' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`} onClick={() => handleCategoryChange('general')}>
                  General
                </button>
                <button className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${selectedCategory === 'account' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`} onClick={() => handleCategoryChange('account')}>
                  Account
                </button>
                <button className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${selectedCategory === 'caregiving' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`} onClick={() => handleCategoryChange('caregiving')}>
                  Caregiving
                </button>
                <button className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${selectedCategory === 'teams' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`} onClick={() => handleCategoryChange('teams')}>
                  Teams
                </button>
                <button className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${selectedCategory === 'technical' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`} onClick={() => handleCategoryChange('technical')}>
                  Technical
                </button>
              </div>
            </div>
            {filteredFAQs.length === 0 ? <div className="text-center py-10">
                <HelpCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">
                  No matching FAQs
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or category filters
                </p>
              </div> : <div className="space-y-4">
                {filteredFAQs.map((faq, index) => <div key={index} className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                    <button className="w-full px-4 py-3 flex justify-between items-center text-left" onClick={() => toggleFAQ(index)} aria-expanded={expandedFAQs.includes(index)}>
                      <span className="font-medium">{faq.question}</span>
                      {expandedFAQs.includes(index) ? <ChevronUpIcon className="w-5 h-5 text-gray-500" /> : <ChevronDownIcon className="w-5 h-5 text-gray-500" />}
                    </button>
                    {expandedFAQs.includes(index) && <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                        <p className="text-gray-700">{faq.answer}</p>
                      </div>}
                  </div>)}
              </div>}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <InfoIcon className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  Can't find what you're looking for? Contact our support team
                  for personalized help.
                </p>
              </div>
            </div>
          </div>}
        {/* Contact Us */}
        {activeTab === 'contact' && <div>
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-2">Get in Touch</h2>
              <p className="text-gray-600 mb-6">
                Our support team is here to help with any questions or issues
                you may have.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center p-4 bg-white rounded-lg border border-gray-200">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    <PhoneIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Call Support</h3>
                    <p className="text-gray-600 text-sm">
                      Monday-Friday, 9am-5pm ET
                    </p>
                    <p className="text-blue-600 font-medium mt-1">
                      1-800-CARE-SUPPORT
                    </p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-white rounded-lg border border-gray-200">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                    <MailIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Email Support</h3>
                    <p className="text-gray-600 text-sm">
                      Response within 24 hours
                    </p>
                    <p className="text-green-600 font-medium mt-1">
                      support@caresupport.example.com
                    </p>
                  </div>
                </div>
              </div>
              <form onSubmit={handleContactSubmit}>
                <h3 className="font-medium mb-4">Send us a message</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <input type="text" id="name" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={contactFormData.name} onChange={e => handleContactInputChange('name', e.target.value)} required />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input type="email" id="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={contactFormData.email} onChange={e => handleContactInputChange('email', e.target.value)} required />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <input type="text" id="subject" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={contactFormData.subject} onChange={e => handleContactInputChange('subject', e.target.value)} required />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea id="message" rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={contactFormData.message} onChange={e => handleContactInputChange('message', e.target.value)} required></textarea>
                  </div>
                  <div className="flex items-center">
                    <input id="consent" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" required />
                    <label htmlFor="consent" className="ml-2 block text-sm text-gray-700">
                      I agree to the{' '}
                      <span className="text-blue-600">privacy policy</span> and
                      consent to being contacted about my inquiry.
                    </label>
                  </div>
                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </div>
              </form>
            </div>
          </div>}
        {/* Guides & Tutorials */}
        {activeTab === 'guides' && <div>
            <h2 className="text-lg font-medium mb-2">Guides & Tutorials</h2>
            <p className="text-gray-600 mb-6">
              Learn how to get the most out of CareSupport with our guides and
              tutorials.
            </p>
            <div className="space-y-4">
              {tutorialGuides.map((guide, index) => <div key={index} className="p-4 bg-white rounded-lg border border-gray-200 flex items-start">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4 flex-shrink-0">
                    {guide.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{guide.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${guide.type === 'video' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {guide.type}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">
                      {guide.description}
                    </p>
                    <button className="mt-3 flex items-center text-sm font-medium text-blue-600" onClick={() => {
                analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
                  feature_name: 'guide_opened',
                  guide_title: guide.title,
                  guide_type: guide.type
                });
              }}>
                      View {guide.type === 'video' ? 'Video' : 'Article'}
                      <ExternalLinkIcon className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>)}
            </div>
            <div className="mt-8">
              <h3 className="font-medium mb-4">Popular Topics</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 bg-white rounded-lg border border-gray-200 text-left hover:bg-gray-50">
                  <h4 className="font-medium text-sm">Getting Started</h4>
                  <p className="text-xs text-gray-500 mt-1">Setup and basics</p>
                </button>
                <button className="p-3 bg-white rounded-lg border border-gray-200 text-left hover:bg-gray-50">
                  <h4 className="font-medium text-sm">Task Management</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Creating and assigning
                  </p>
                </button>
                <button className="p-3 bg-white rounded-lg border border-gray-200 text-left hover:bg-gray-50">
                  <h4 className="font-medium text-sm">Team Coordination</h4>
                  <p className="text-xs text-gray-500 mt-1">Working together</p>
                </button>
                <button className="p-3 bg-white rounded-lg border border-gray-200 text-left hover:bg-gray-50">
                  <h4 className="font-medium text-sm">Voice Features</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Recording care notes
                  </p>
                </button>
              </div>
            </div>
          </div>}
        {/* Troubleshooting */}
        {activeTab === 'troubleshoot' && <div>
            <h2 className="text-lg font-medium mb-2">Troubleshooting</h2>
            <p className="text-gray-600 mb-6">
              Common issues and how to resolve them.
            </p>
            <div className="space-y-4">
              {troubleshootingItems.map((item, index) => <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center">
                      <AlertTriangleIcon className="w-5 h-5 text-orange-500 mr-3" />
                      <h3 className="font-medium">{item.title}</h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Try these steps:
                    </h4>
                    <ol className="list-decimal pl-5 space-y-2">
                      {item.steps.map((step, stepIndex) => <li key={stepIndex} className="text-sm text-gray-600">
                          {step}
                        </li>)}
                    </ol>
                  </div>
                </div>)}
            </div>
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <InfoIcon className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-700 font-medium">
                    Still having issues?
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    If the above solutions don't resolve your problem, please
                    contact our support team for personalized assistance.
                  </p>
                  <button className="mt-3 text-sm font-medium text-blue-700 underline" onClick={() => handleTabChange('contact')}>
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>}
        {/* Community */}
        {activeTab === 'community' && <div>
            <h2 className="text-lg font-medium mb-2">Community Resources</h2>
            <p className="text-gray-600 mb-6">
              Connect with other caregivers and access shared resources.
            </p>
            <div className="space-y-4 mb-8">
              {communityResources.map((resource, index) => <div key={index} className="p-4 bg-white rounded-lg border border-gray-200 flex items-start">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4 flex-shrink-0">
                    {resource.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{resource.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {resource.description}
                    </p>
                    <button className="mt-3 flex items-center text-sm font-medium text-blue-600" onClick={() => {
                analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
                  feature_name: 'community_resource_opened',
                  resource_title: resource.title
                });
              }}>
                      Learn More
                      <ExternalLinkIcon className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>)}
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-medium text-purple-800 mb-2">
                Join the Conversation
              </h3>
              <p className="text-sm text-purple-700 mb-4">
                Share your experiences, ask questions, and connect with other
                caregivers in our community forum.
              </p>
              <Button variant="secondary" className="w-full bg-purple-100 text-purple-700 hover:bg-purple-200" onClick={() => {
            analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
              feature_name: 'community_forum_opened'
            });
          }}>
                <UsersIcon className="w-4 h-4 mr-2" />
                Visit Community Forum
              </Button>
            </div>
          </div>}
      </div>
    </div>;
};
const MapPinIcon = ({
  className
}) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>;