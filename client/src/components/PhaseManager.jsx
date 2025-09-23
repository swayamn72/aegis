import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Settings, Plus, X, Edit2, Trash2, AlertCircle, Trophy } from 'lucide-react';

const PhaseManager = ({ isOpen, onClose, onSave, initialPhases = [] }) => {
  const [phases, setPhases] = useState([]);
  const [errors, setErrors] = useState({});

  const phaseTypes = [
    'qualifier',
    'group_stage',
    'elimination_stage',
    'final_stage'
  ];

  // Map UI-friendly phase types to schema enum values
  const mapPhaseTypeToSchema = (uiType) => {
    return uiType; // Already using schema enum values
  };

  const formatOptions = [
    'Single Elimination',
    'Double Elimination',
    'Round Robin',
    'Swiss System',
    'Battle Royale',
    'Points System',
    'Custom'
  ];

  useEffect(() => {
    if (initialPhases.length > 0) {
      setPhases(initialPhases.map(phase => ({ ...phase, groups: phase.groups || [] })));
    } else {
      // Initialize with default phases
      setPhases([
        {
          name: 'Registration',
          type: 'qualifier',
          format: 'Custom',
          startDate: '',
          endDate: '',
          description: 'Team registration period',
          status: 'upcoming',
          groups: []
        },
        {
          name: 'Qualifiers',
          type: 'qualifier',
          format: 'Battle Royale',
          startDate: '',
          endDate: '',
          description: 'Open qualifiers for all teams',
          status: 'upcoming',
          groups: []
        },
        {
          name: 'Finals',
          type: 'final_stage',
          format: 'Single Elimination',
          startDate: '',
          endDate: '',
          description: 'Main tournament finals',
          status: 'upcoming',
          groups: []
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
      type: 'qualifier',
      format: 'Single Elimination',
      startDate: '',
      endDate: '',
      description: '',
      status: 'upcoming'
    };
    setPhases([...phases, newPhase]);
  };

  const removePhase = (index) => {
    if (phases.length <= 1) return; // Keep at least one phase
    const newPhases = phases.filter((_, i) => i !== index);
    setPhases(newPhases);
    validatePhases(newPhases);
  };

  const addGroup = (phaseIndex) => {
    const newPhases = [...phases];
    newPhases[phaseIndex].groups.push({
      name: '',
      teams: [],
      standings: []
    });
    setPhases(newPhases);
  };

  const removeGroup = (phaseIndex, groupIndex) => {
    const newPhases = [...phases];
    newPhases[phaseIndex].groups.splice(groupIndex, 1);
    setPhases(newPhases);
  };

  const handleGroupChange = (phaseIndex, groupIndex, field, value) => {
    const newPhases = [...phases];
    newPhases[phaseIndex].groups[groupIndex][field] = value;
    setPhases(newPhases);
  };

  const validatePhases = (phaseList) => {
    const newErrors = {};

    phaseList.forEach((phase, index) => {
      if (!phase.name.trim()) {
        newErrors[`${index}_name`] = 'Phase name is required';
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

      // Check for overlapping phases
      phaseList.forEach((otherPhase, otherIndex) => {
        if (index !== otherIndex &&
            phase.startDate && phase.endDate &&
            otherPhase.startDate && otherPhase.endDate) {

          const phaseStart = new Date(phase.startDate);
          const phaseEnd = new Date(phase.endDate);
          const otherStart = new Date(otherPhase.startDate);
          const otherEnd = new Date(otherPhase.endDate);

          if ((phaseStart < otherEnd && phaseEnd > otherStart)) {
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
      type: mapPhaseTypeToSchema(phase.type) // Map UI type to schema enum value
    }));
    onSave(validPhases);
    onClose();
  };

  const getPhaseIcon = (type) => {
    switch (type) {
      case 'Registration':
        return <Settings className="w-5 h-5" />;
      case 'Qualifiers':
        return <Calendar className="w-5 h-5" />;
      case 'Finals':
      case 'Grand Finals':
        return <Trophy className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-semibold text-white">Tournament Phases</h2>
            <p className="text-zinc-400 text-sm">Manage tournament phases and their schedules</p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Phases List */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-6">
            {phases.map((phase, index) => (
              <div key={index} className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
                {/* Phase Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-orange-500">
                      {getPhaseIcon(phase.type)}
                    </div>
                    <div>
                      <h3 className="text-white font-medium">
                        Phase {index + 1}: {phase.name || 'Untitled Phase'}
                      </h3>
                      <p className="text-zinc-400 text-sm">{phase.description}</p>
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

                {/* Phase Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Phase Name</label>
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
                    <label className="block text-sm text-zinc-400 mb-2">Phase Type</label>
                    <select
                      value={phase.type}
                      onChange={(e) => handlePhaseChange(index, 'type', e.target.value)}
                      className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {phaseTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Format</label>
                    <select
                      value={phase.format}
                      onChange={(e) => handlePhaseChange(index, 'format', e.target.value)}
                      className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {formatOptions.map(format => (
                        <option key={format} value={format}>{format}</option>
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
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Start Date & Time</label>
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
                    <label className="block text-sm text-zinc-400 mb-2">End Date & Time</label>
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
                  <label className="block text-sm text-zinc-400 mb-2">Description</label>
                  <textarea
                    value={phase.description}
                    onChange={(e) => handlePhaseChange(index, 'description', e.target.value)}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={2}
                    placeholder="Enter phase description"
                  />
                </div>

                {/* Groups Section */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-medium">Groups</h4>
                    <button
                      onClick={() => addGroup(index)}
                      className="text-orange-500 hover:text-orange-400 transition-colors"
                      title="Add group to this phase"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {phase.groups.map((group, groupIndex) => (
                      <div key={groupIndex} className="bg-zinc-700/50 rounded-lg p-4 border border-zinc-600">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-white font-medium">Group {groupIndex + 1}: {group.name || 'Untitled Group'}</h5>
                          <button
                            onClick={() => removeGroup(index, groupIndex)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-zinc-400 mb-2">Group Name</label>
                            <input
                              type="text"
                              value={group.name}
                              onChange={(e) => handleGroupChange(index, groupIndex, 'name', e.target.value)}
                              className="w-full bg-zinc-600 border border-zinc-500 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="Enter group name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-zinc-400 mb-2">Teams (comma-separated IDs)</label>
                            <input
                              type="text"
                              value={group.teams.join(', ')}
                              onChange={(e) => handleGroupChange(index, groupIndex, 'teams', e.target.value.split(',').map(id => id.trim()))}
                              className="w-full bg-zinc-600 border border-zinc-500 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="Enter team IDs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
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

          {/* Add Phase Button */}
          <button
            onClick={addPhase}
            className="w-full mt-6 py-3 border-2 border-dashed border-zinc-600 rounded-lg text-zinc-400 hover:border-orange-500 hover:text-orange-500 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add Phase
          </button>
        </div>

        {/* Footer */}
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
