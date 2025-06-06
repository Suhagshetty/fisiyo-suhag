import React, { useState, useCallback, useMemo } from 'react';
import { Plus, Upload, X, Settings, Users, Lock, Globe, Eye, EyeOff, Palette, Shield, AlertCircle } from 'lucide-react';
 
  const CommunityCreator = ()=> {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    avatarUrl: '',
    bannerUrl: '',
    isPrivate: false,
    requirePostApproval: false,
    defaultSort: 'hot',
    colorPrimary: '#0079D3',
    colorSecondary: '#FFFFFF',
    rules: []
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [showPreview, setShowPreview] = useState(false);
  const [newRule, setNewRule] = useState({ title: '', description: '' });
  const [errors, setErrors] = useState({});
  const [imageLoadErrors, setImageLoadErrors] = useState({
    avatar: false,
    banner: false
  });

  // Validation rules
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Community name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Community name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Community name must be at least 3 characters';
    } else if (formData.name.length > 21) {
      newErrors.name = 'Community name must be 21 characters or less';
    } else if (!/^[a-z0-9]+$/.test(formData.name)) {
      newErrors.name = 'Community name can only contain lowercase letters and numbers';
    }

    // Display title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Display title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Display title must be 100 characters or less';
    }

    // Description validation
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less';
    }

    // URL validation
    const urlPattern = /^https?:\/\/.+/;
    if (formData.avatarUrl && !urlPattern.test(formData.avatarUrl)) {
      newErrors.avatarUrl = 'Avatar URL must be a valid HTTP/HTTPS URL';
    }
    if (formData.bannerUrl && !urlPattern.test(formData.bannerUrl)) {
      newErrors.bannerUrl = 'Banner URL must be a valid HTTP/HTTPS URL';
    }

    // Color validation
    const colorPattern = /^#[0-9A-Fa-f]{6}$/;
    if (!colorPattern.test(formData.colorPrimary)) {
      newErrors.colorPrimary = 'Primary color must be a valid hex color';
    }
    if (!colorPattern.test(formData.colorSecondary)) {
      newErrors.colorSecondary = 'Secondary color must be a valid hex color';
    }

    // Rules validation
    if (formData.rules.length > 15) {
      newErrors.rules = 'Maximum 15 rules allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle input changes with validation
  const handleInputChange = useCallback((field, value) => {
    let processedValue = value;
    
    if (field === 'name') {
      // Clean community name: lowercase, alphanumeric only
      processedValue = value.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 21);
    } else if (field === 'title') {
      // Limit title length
      processedValue = value.slice(0, 100);
    } else if (field === 'description') {
      // Limit description length
      processedValue = value.slice(0, 500);
    } else if (field === 'colorPrimary' || field === 'colorSecondary') {
      // Ensure color format
      if (value.startsWith('#') && value.length <= 7) {
        processedValue = value.toUpperCase();
      }
    }

    setFormData(prev => ({ ...prev, [field]: processedValue }));
    
    // Clear specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  // Add rule with validation
  const addRule = useCallback(() => {
    const title = newRule.title.trim();
    const description = newRule.description.trim();
    
    if (!title) return;
    
    if (title.length > 100) {
      alert('Rule title must be 100 characters or less');
      return;
    }
    
    if (description.length > 300) {
      alert('Rule description must be 300 characters or less');
      return;
    }
    
    if (formData.rules.length >= 15) {
      alert('Maximum 15 rules allowed');
      return;
    }
    
    // Check for duplicate rule titles
    if (formData.rules.some(rule => rule.title.toLowerCase() === title.toLowerCase())) {
      alert('A rule with this title already exists');
      return;
    }

    setFormData(prev => ({
      ...prev,
      rules: [...prev.rules, { title, description }]
    }));
    setNewRule({ title: '', description: '' });
  }, [newRule, formData.rules]);

  // Remove rule
  const removeRule = useCallback((index) => {
    if (index < 0 || index >= formData.rules.length) return;
    
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  }, [formData.rules.length]);

  // Handle image load errors
  const handleImageError = useCallback((type) => {
    setImageLoadErrors(prev => ({ ...prev, [type]: true }));
  }, []);

  // Handle image load success
  const handleImageLoad = useCallback((type) => {
    setImageLoadErrors(prev => ({ ...prev, [type]: false }));
  }, []);

  // Submit handler
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Please fix the errors before submitting');
      return;
    }

    // Create clean data object
    const cleanData = {
      ...formData,
      name: formData.name.trim(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      avatarUrl: formData.avatarUrl.trim(),
      bannerUrl: formData.bannerUrl.trim(),
      rules: formData.rules.map(rule => ({
        title: rule.title.trim(),
        description: rule.description.trim()
      }))
    };

    console.log('Community Data:', JSON.stringify(cleanData, null, 2));
    alert('Community data logged to console. Check browser developer tools.');
  }, [formData, validateForm]);

  // Memoized tab configuration
  const tabs = useMemo(() => [
    { id: 'basic', label: 'Basic Info', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'rules', label: 'Rules', icon: Shield }
  ], []);

  // Character count helpers
  const getCharacterCount = useCallback((text, max) => {
    const count = text?.length || 0;
    const isOverLimit = count > max;
    return { count, max, isOverLimit };
  }, []);

  // Error display component
  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return (
      <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
        <AlertCircle size={12} />
        {error}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent mb-3">
            Create Your Community
          </h1>
          <p className="text-slate-600 text-lg">Build a space where your ideas can flourish</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              {/* Tab Navigation */}
              <div className="border-b border-slate-200 bg-white/50">
                <div className="flex overflow-x-auto">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const hasError = Object.keys(errors).some(key => {
                      if (tab.id === 'basic') return ['name', 'title', 'description', 'avatarUrl', 'bannerUrl'].includes(key);
                      if (tab.id === 'appearance') return ['colorPrimary', 'colorSecondary'].includes(key);
                      if (tab.id === 'rules') return key === 'rules';
                      return false;
                    });

                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap relative ${
                          activeTab === tab.id
                            ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <Icon size={18} />
                        {tab.label}
                        {hasError && (
                          <div className="w-2 h-2 bg-red-500 rounded-full absolute top-2 right-2"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab Content */}
              <form onSubmit={handleSubmit} className="p-8">
                {activeTab === 'basic' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Community Name *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="javascript"
                          className={`w-full px-4 py-3 rounded-xl border transition-all ${
                            errors.name 
                              ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                              : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                          }`}
                          maxLength={21}
                          required
                        />
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs text-slate-500">Lowercase letters and numbers only</p>
                          <span className="text-xs text-slate-400">{formData.name.length}/21</span>
                        </div>
                        <ErrorMessage error={errors.name} />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Display Title *
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          placeholder="Learn JavaScript"
                          className={`w-full px-4 py-3 rounded-xl border transition-all ${
                            errors.title 
                              ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                              : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                          }`}
                          maxLength={100}
                          required
                        />
                        <div className="flex justify-between items-center mt-1">
                          <span></span>
                          <span className="text-xs text-slate-400">{formData.title.length}/100</span>
                        </div>
                        <ErrorMessage error={errors.title} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Tell people what your community is about..."
                        rows={4}
                        className={`w-full px-4 py-3 rounded-xl border transition-all resize-none ${
                          errors.description 
                            ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                            : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                        }`}
                        maxLength={500}
                      />
                      <div className="flex justify-between items-center mt-1">
                        <span></span>
                        <span className={`text-xs ${formData.description.length > 450 ? 'text-orange-500' : 'text-slate-400'}`}>
                          {formData.description.length}/500
                        </span>
                      </div>
                      <ErrorMessage error={errors.description} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Avatar URL
                        </label>
                        <div className="relative">
                          <input
                            type="url"
                            value={formData.avatarUrl}
                            onChange={(e) => handleInputChange('avatarUrl', e.target.value)}
                            placeholder="https://example.com/avatar.jpg"
                            className={`w-full px-4 py-3 pr-12 rounded-xl border transition-all ${
                              errors.avatarUrl 
                                ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                                : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                            }`}
                          />
                          <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                        </div>
                        <ErrorMessage error={errors.avatarUrl} />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Banner URL
                        </label>
                        <div className="relative">
                          <input
                            type="url"
                            value={formData.bannerUrl}
                            onChange={(e) => handleInputChange('bannerUrl', e.target.value)}
                            placeholder="https://example.com/banner.jpg"
                            className={`w-full px-4 py-3 pr-12 rounded-xl border transition-all ${
                              errors.bannerUrl 
                                ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                                : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                            }`}
                          />
                          <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                        </div>
                        <ErrorMessage error={errors.bannerUrl} />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-50 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {formData.isPrivate ? <Lock size={20} className="text-red-500" /> : <Globe size={20} className="text-green-500" />}
                            <span className="font-semibold text-slate-700">Privacy</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.isPrivate}
                              onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        <p className="text-sm text-slate-600">
                          {formData.isPrivate ? 'Invite-only community' : 'Public community'}
                        </p>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Shield size={20} className="text-orange-500" />
                            <span className="font-semibold text-slate-700">Post Approval</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.requirePostApproval}
                              onChange={(e) => handleInputChange('requirePostApproval', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        <p className="text-sm text-slate-600">
                          Require moderator approval for new posts
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Default Post Sort
                      </label>
                      <select
                        value={formData.defaultSort}
                        onChange={(e) => handleInputChange('defaultSort', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                      >
                        <option value="hot">Hot</option>
                        <option value="new">New</option>
                        <option value="top">Top</option>
                        <option value="rising">Rising</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Primary Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={formData.colorPrimary}
                            onChange={(e) => handleInputChange('colorPrimary', e.target.value)}
                            className="w-16 h-12 rounded-lg border border-slate-200 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={formData.colorPrimary}
                            onChange={(e) => handleInputChange('colorPrimary', e.target.value)}
                            className={`flex-1 px-4 py-3 rounded-xl border transition-all ${
                              errors.colorPrimary 
                                ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                                : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                            }`}
                            pattern="^#[0-9A-Fa-f]{6}$"
                            placeholder="#0079D3"
                          />
                        </div>
                        <ErrorMessage error={errors.colorPrimary} />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Secondary Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={formData.colorSecondary}
                            onChange={(e) => handleInputChange('colorSecondary', e.target.value)}
                            className="w-16 h-12 rounded-lg border border-slate-200 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={formData.colorSecondary}
                            onChange={(e) => handleInputChange('colorSecondary', e.target.value)}
                            className={`flex-1 px-4 py-3 rounded-xl border transition-all ${
                              errors.colorSecondary 
                                ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                                : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                            }`}
                            pattern="^#[0-9A-Fa-f]{6}$"
                            placeholder="#FFFFFF"
                          />
                        </div>
                        <ErrorMessage error={errors.colorSecondary} />
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-6 border border-slate-200">
                      <h3 className="font-semibold text-slate-700 mb-3">Color Preview</h3>
                      <div className="flex items-center gap-4">
                        <div
                          className="w-16 h-16 rounded-xl shadow-md border border-slate-200"
                          style={{ backgroundColor: formData.colorPrimary }}
                          title={`Primary: ${formData.colorPrimary}`}
                        ></div>
                        <div
                          className="w-16 h-16 rounded-xl shadow-md border border-slate-200"
                          style={{ backgroundColor: formData.colorSecondary }}
                          title={`Secondary: ${formData.colorSecondary}`}
                        ></div>
                        <div className="flex-1">
                          <p className="text-sm text-slate-600 mb-2">
                            Preview your community's color scheme
                          </p>
                          <div className="flex gap-2 text-xs text-slate-500">
                            <span>Primary: {formData.colorPrimary}</span>
                            <span>•</span>
                            <span>Secondary: {formData.colorSecondary}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'rules' && (
                  <div className="space-y-6">
                    <div className="bg-slate-50 rounded-xl p-6">
                      <h3 className="font-semibold text-slate-700 mb-4">
                        Add New Rule ({formData.rules.length}/15)
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <input
                            type="text"
                            value={newRule.title}
                            onChange={(e) => setNewRule(prev => ({ ...prev, title: e.target.value.slice(0, 100) }))}
                            placeholder="Rule title"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                            maxLength={100}
                          />
                          <div className="flex justify-between items-center mt-1">
                            <span></span>
                            <span className="text-xs text-slate-400">{newRule.title.length}/100</span>
                          </div>
                        </div>
                        <div>
                          <textarea
                            value={newRule.description}
                            onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value.slice(0, 300) }))}
                            placeholder="Rule description (optional)"
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                            maxLength={300}
                          />
                          <div className="flex justify-between items-center mt-1">
                            <span></span>
                            <span className="text-xs text-slate-400">{newRule.description.length}/300</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={addRule}
                          disabled={!newRule.title.trim() || formData.rules.length >= 15}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                        >
                          <Plus size={16} />
                          Add Rule
                        </button>
                      </div>
                    </div>

                    {formData.rules.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-semibold text-slate-700">Community Rules</h3>
                        {formData.rules.map((rule, index) => (
                          <div key={`${rule.title}-${index}`} className="bg-white rounded-xl p-4 border border-slate-200 group hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                                    {index + 1}
                                  </span>
                                  <h4 className="font-medium text-slate-900 truncate">{rule.title}</h4>
                                </div>
                                {rule.description && (
                                  <p className="text-sm text-slate-600 ml-6 break-words">{rule.description}</p>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => removeRule(index)}
                                className="ml-3 p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                                title="Remove rule"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <ErrorMessage error={errors.rules} />
                  </div>
                )}

                {/* Submit Button */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.02] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      disabled={Object.keys(errors).length > 0}
                    >
                      Create Community
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className="flex items-center gap-2 px-6 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                      Preview
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <div className="p-6">
                  <h3 className="font-semibold text-slate-700 mb-4">Live Preview</h3>
                  
                  {/* Community Card Preview */}
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    {/* Banner Section */}
                    {formData.bannerUrl && !imageLoadErrors.banner && (
                      <div className="h-24 bg-gradient-to-r from-slate-100 to-slate-200 relative overflow-hidden">
                        <img 
                          src={formData.bannerUrl} 
                          alt="Community Banner" 
                          className="w-full h-full object-cover"
                          onError={() => handleImageError('banner')}
                          onLoad={() => handleImageLoad('banner')}
                        />
                      </div>
                    )}
                    
                    <div className="p-4">
                      {/* Community Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md overflow-hidden"
                          style={{ backgroundColor: formData.colorPrimary }}
                        >
                          {formData.avatarUrl && !imageLoadErrors.avatar ? (
                            <img 
                              src={formData.avatarUrl} 
                              alt="Community Avatar" 
                              className="w-full h-full object-cover"
                              onError={() => handleImageError('avatar')}
                              onLoad={() => handleImageLoad('avatar')}
                            />
                          ) : (
                            <span className="select-none">
                              {formData.title ? formData.title.charAt(0).toUpperCase() : 
                               formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-900 truncate">
                            {formData.title || 'Community Title'}
                          </h4>
                          <p className="text-sm text-slate-600 truncate">
                            c/{formData.name || 'community-name'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Description */}
                      {formData.description && (
                        <div className="mb-3">
                          <p className="text-sm text-slate-600 line-clamp-3 break-words">
                            {formData.description}
                          </p>
                        </div>
                      )}
                      
                      {/* Community Stats */}
                      <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          0 members
                        </span>
                        <span className="flex items-center gap-1">
                          <Globe size={12} />
                          Created today
                        </span>
                        {formData.isPrivate && (
                          <span className="flex items-center gap-1 text-red-500">
                            <Lock size={12} />
                            Private
                          </span>
                        )}
                      </div>

                      {/* Settings Indicators */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {formData.requirePostApproval && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                            <Shield size={10} />
                            Moderated
                          </span>
                        )}
                        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          Sort: {formData.defaultSort}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rules Preview */}
                  {formData.rules.length > 0 && (
                    <div className="mt-4 bg-slate-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-slate-700">Community Rules</h4>
                        <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded-full">
                          {formData.rules.length}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {formData.rules.slice(0, 5).map((rule, index) => (
                          <div key={`preview-${index}`} className="text-sm">
                            <div className="flex items-start gap-2">
                              <span className="text-blue-600 font-medium text-xs mt-0.5 flex-shrink-0">
                                {index + 1}.
                              </span>
                              <div className="flex-1 min-w-0">
                                <span className="font-medium text-slate-700 block truncate">
                                  {rule.title}
                                </span>
                                {rule.description && (
                                  <span className="text-slate-500 text-xs block truncate">
                                    {rule.description}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {formData.rules.length > 5 && (
                          <p className="text-xs text-slate-500 text-center pt-2 border-t border-slate-200">
                            +{formData.rules.length - 5} more rules
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Form Validation Status */}
                  {Object.keys(errors).length > 0 && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle size={16} className="text-red-500" />
                        <h4 className="font-medium text-red-700">Please fix these errors:</h4>
                      </div>
                      <ul className="text-sm text-red-600 space-y-1">
                        {Object.entries(errors).map(([field, error]) => (
                          <li key={field} className="flex items-start gap-1">
                            <span className="text-xs mt-1">•</span>
                            <span>{error}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Success Indicator */}
                  {Object.keys(errors).length === 0 && (formData.name || formData.title) && (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <span className="text-green-700 font-medium text-sm">
                          Ready to create!
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Tips */}
              {showPreview && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-medium text-blue-900 mb-2">💡 Tips</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Choose a memorable, descriptive name</li>
                    <li>• Add clear rules to guide your community</li>
                    <li>• Use high-quality images for avatar and banner</li>
                    <li>• Consider starting as public to grow faster</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Debug Panel (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 bg-slate-100 rounded-xl p-4">
            <details className="cursor-pointer">
              <summary className="font-medium text-slate-700 mb-2">Debug Info</summary>
              <pre className="text-xs text-slate-600 overflow-auto max-h-40 bg-white p-3 rounded-lg">
                {JSON.stringify({ formData, errors, imageLoadErrors }, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}


 
export default CommunityCreator;
