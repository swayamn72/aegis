import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, X, Trash2, AlertCircle, Trophy, Target } from 'lucide-react';

const PhaseManager = ({ isOpen, onClose, onSave, initialPhases = [] }) => {
  const [phases, setPhases] = useState([]);
  const [errors, setErrors] = useState({});

  const phaseTypes = ['qualifiers', 'final_stage'];

  useEffect(() => {
    if (initialPhases.length > 0) {
      setPhases(initialPhases.map(phase => ({
        ...phase,
        startDate: phase.startDate ? new Date(phase.startDate).toISOString().slice(0, 16) : '',
        endDate: phase.endDate ? new Date(phase.endDate).toISOString().slice(0, 16) : '',
        rulesetSpecifics: phase.rulesetSpecifics || '',
        details: phase.details || '',
        qualificationRules: phase.qualificationRules || []
      })));
    } else {
      setPhases([
        {
          name: 'Qualifiers',
          type: 'qualifiers',
          startDate: '',
          endDate: '',
          details: 'Open qualifiers for all teams',
          status: 'upcoming',
          rulesetSpecifics: '',
          teams: [],
          groups: [],
          qualificationRules: [
            {
              numberOfTeams: 16,
              source: 'overall',
              nextPhase: ''
            }
          ]
        },
        {
          name: 'Final Stage',
          type: 'final_stage',
          startDate: '',
          endDate: '',
          details: 'Main tournament finals',
          status: 'upcoming',
          rulesetSpecifics: '',
          teams: [],
          groups: [],
          qualificationRules: []
        }
      ]);
    }
  }, [initialPhases]);

  const handlePhaseChange = (index, field, value) => {
    const newPhases = [...phases];
    newPhases[index][field] = value;
    setPhases(newPhases);
    validatePhases(newPhases);
  };

  const addPhase = () => {
    const newPhase = {
      name: '',
      type: 'qualifiers',
      startDate: '',
      endDate: '',
      details: '',
      status: 'upcoming',
      rulesetSpecifics: '',
      teams: [],
      groups: [],
      qualificationRules: []
    };
    setPhases([...phases, newPhase]);
  };

  const removePhase = (index) => {
    if (phases.length <= 1) return;
    const newPhases = phases.filter((_, i) => i !== index);
    setPhases(newPhases);
    validatePhases(newPhases);
  };

  const addQualificationRule = (phaseIndex) => {
    const newPhases = [...phases];
    if (!newPhases[phaseIndex].qualificationRules) {
      newPhases[phaseIndex].qualificationRules = [];
    }
    
    newPhases[phaseIndex].qualificationRules.push({
      numberOfTeams: 1,
      source: 'overall',
      nextPhase: phaseIndex + 1 < phases.length ? phases[phaseIndex + 1].name : ''
    });
    
    setPhases(newPhases);
  };

  const removeQualificationRule = (phaseIndex, ruleIndex) => {
    const newPhases = [...phases];
    newPhases[phaseIndex].qualificationRules.splice(ruleIndex, 1);
    setPhases(newPhases);
  };

  const handleQualificationRuleChange = (phaseIndex, ruleIndex, field, value) => {
    const newPhases = [...phases];
    newPhases[phaseIndex].qualificationRules[ruleIndex][field] = value;
    setPhases(newPhases);
  };

  const validatePhases = (phaseList) => {
    const newErrors = {};

    phaseList.forEach((phase, index) => {
      if (!phase.name.trim()) {
        newErrors[`${index}_name`] = 'Phase name is required';
      }

      if (!phase.type || !phaseTypes.includes(phase.type)) {
        newErrors[`${index}_type`] = 'Valid phase type is required';
      }

      if (!phase.startDate) {
        newErrors[`${index}_startDate`] = 'Start date is required';
      }

      if (!phase.endDate) {
        newErrors[`${index}_endDate`] = 'End date is required';
      }

      if (phase.startDate && phase.endDate && phase.startDate >= phase.endDate) {
        newErrors[`${index}_dates`] = 'End date must be after start date';
      }

      phaseList.forEach((otherPhase, otherIndex) => {
        if (index !== otherIndex && phase.startDate && phase.endDate && 
            otherPhase.startDate && otherPhase.endDate) {
          const phaseStart = new Date(phase.startDate);
          const phaseEnd = new Date(phase.endDate);
          const otherStart = new Date(otherPhase.startDate);
          const otherEnd = new Date(otherPhase.endDate);

          if (phaseStart < otherEnd && phaseEnd > otherStart) {
            newErrors[`${index}_overlap`] = 'Phase dates overlap with another phase';
          }
        }
      });
    });

    setErrors(newErrors);
  };

  const handleSave = () => {
    if (Object.keys(errors).length > 0) return;

    const validPhases = phases.filter(phase => phase.name.trim()).map(phase => ({
      ...phase,
      teams: phase.teams || [],
      groups: phase.groups || [],
      matches: phase.matches || [],
      qualificationRules: (phase.qualificationRules || []).map(rule => ({
        numberOfTeams: parseInt(rule.numberOfTeams) || 1,
        source: rule.source || 'overall',
        nextPhase: rule.nextPhase || ''
      }))
    }));
    
    onSave(validPhases);
    onClose();
  };

  const getPhaseIcon = (type) => {
    switch (type) {
      case 'qualifiers':
        return <Target className="w-5 h-5" />;
      case 'final_stage':
        return <Trophy className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-semibold text-white">Tournament Phases</h2>
            <p className="text-zinc-400 text-sm">Configure tournament structure and advancement rules</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-6">
            {phases.map((phase, index) => (
              <div key={index} className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-orange-500">{getPhaseIcon(phase.type)}</div>
                    <div>
                      <h3 className="text-white font-medium">Phase {index + 1}: {phase.name || 'Untitled'}</h3>
                      <p className="text-zinc-400 text-sm">{phase.details}</p>
                    </div>
                  </div>
                  {phases.length > 1 && (
                    <button
                      onClick={() => removePhase(index)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Phase Name *</label>
                    <input
                      type="text"
                      value={phase.name}
                      onChange={(e) => handlePhaseChange(index, 'name', e.target.value)}
                      className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Enter phase name"
                    />
                    {errors[`${index}_name`] && (
                      <p className="text-red-400 text-xs mt-1">{errors[`${index}_name`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Phase Type *</label>
                    <select
                      value={phase.type}
                      onChange={(e) => handlePhaseChange(index, 'type', e.target.value)}
                      className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {phaseTypes.map(type => (
                        <option key={type} value={type}>
                          {type.replace('_', ' ').toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Status</label>
                    <select
                      value={phase.status}
                      onChange={(e) => handlePhaseChange(index, 'status', e.target.value)}
                      className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Start Date & Time *</label>
                    <input
                      type="datetime-local"
                      value={phase.startDate}
                      onChange={(e) => handlePhaseChange(index, 'startDate', e.target.value)}
                      className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {errors[`${index}_startDate`] && (
                      <p className="text-red-400 text-xs mt-1">{errors[`${index}_startDate`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">End Date & Time *</label>
                    <input
                      type="datetime-local"
                      value={phase.endDate}
                      onChange={(e) => handlePhaseChange(index, 'endDate', e.target.value)}
                      className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {errors[`${index}_endDate`] && (
                      <p className="text-red-400 text-xs mt-1">{errors[`${index}_endDate`]}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm text-zinc-400 mb-2">Details</label>
                  <textarea
                    value={phase.details}
                    onChange={(e) => handlePhaseChange(index, 'details', e.target.value)}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={2}
                    placeholder="Enter phase details"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm text-zinc-400 mb-2">Ruleset Specifics</label>
                  <textarea
                    value={phase.rulesetSpecifics}
                    onChange={(e) => handlePhaseChange(index, 'rulesetSpecifics', e.target.value)}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={2}
                    placeholder="Enter phase-specific rules"
                  />
                </div>

                {/* Qualification Rules */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm text-zinc-400">Team Advancement Rules</label>
                    <button
                      onClick={() => addQualificationRule(index)}
                      className="text-orange-400 hover:text-orange-300 text-sm flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Rule
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {(phase.qualificationRules || []).map((rule, ruleIndex) => (
                      <div key={ruleIndex} className="bg-zinc-700/50 rounded p-4 border border-zinc-600">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div>
                            <label className="block text-xs text-zinc-400 mb-1">Number of Teams</label>
                            <input
                              type="number"
                              min="1"
                              value={rule.numberOfTeams}
                              onChange={(e) => handleQualificationRuleChange(index, ruleIndex, 'numberOfTeams', e.target.value)}
                              className="w-full bg-zinc-600 border border-zinc-500 rounded px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs text-zinc-400 mb-1">Source</label>
                            <select
                              value={rule.source}
                              onChange={(e) => handleQualificationRuleChange(index, ruleIndex, 'source', e.target.value)}
                              className="w-full bg-zinc-600 border border-zinc-500 rounded px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                            >
                              <option value="overall">Overall Standings</option>
                              <option value="from_each_group">From Each Group</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs text-zinc-400 mb-1">Next Phase</label>
                            <select
                              value={rule.nextPhase}
                              onChange={(e) => handleQualificationRuleChange(index, ruleIndex, 'nextPhase', e.target.value)}
                              className="w-full bg-zinc-600 border border-zinc-500 rounded px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                            >
                              <option value="">Select Phase</option>
                              {phases.map((p, pIndex) => {
                                if (pIndex > index) {
                                  return (
                                    <option key={pIndex} value={p.name}>
                                      {p.name || `Phase ${pIndex + 1}`}
                                    </option>
                                  );
                                }
                                return null;
                              })}
                            </select>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-zinc-400">
                            Top <strong className="text-white">{rule.numberOfTeams}</strong> teams from{' '}
                            <strong className="text-white">
                              {rule.source === 'overall' ? 'overall standings' : 'each group'}
                            </strong>{' '}
                            advance to{' '}
                            <strong className="text-orange-400">
                              {rule.nextPhase || 'next phase'}
                            </strong>
                          </p>
                          <button
                            onClick={() => removeQualificationRule(index, ruleIndex)}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {(!phase.qualificationRules || phase.qualificationRules.length === 0) && (
                      <div className="text-center py-4 text-zinc-500 text-sm">
                        No advancement rules set. All teams will remain in this phase.
                      </div>
                    )}
                  </div>
                </div>

                {errors[`${index}_dates`] && (
                  <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-400" />
                    <span className="text-red-400 text-sm">{errors[`${index}_dates`]}</span>
                  </div>
                )}

                {errors[`${index}_overlap`] && (
                  <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded flex items-center gap-2">
                    <AlertCircle size={16} className="text-yellow-400" />
                    <span className="text-yellow-400 text-sm">{errors[`${index}_overlap`]}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={addPhase}
            className="w-full mt-6 py-3 border-2 border-dashed border-zinc-600 rounded-lg text-zinc-400 hover:border-orange-500 hover:text-orange-500 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add Phase
          </button>
        </div>

        <div className="p-6 border-t border-zinc-800 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={Object.keys(errors).length > 0}
            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Phases
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhaseManager;