import React, { useState, useEffect } from 'react';
import { Trophy, DollarSign, Percent, Plus, X, AlertCircle, Award, Star } from 'lucide-react';

const PrizeDistributionForm = ({ isOpen, onClose, onSave, initialDistribution = [], initialIndividualAwards = [], totalPrizePool = 0 }) => {
  const [distribution, setDistribution] = useState([]);
  const [individualAwards, setIndividualAwards] = useState([]);
  const [errors, setErrors] = useState({});
  const [distributionType, setDistributionType] = useState('percentage'); // 'percentage' or 'fixed'

  // Predefined individual award types
  const awardTypes = [
    'MVP',
    'Best IGL',
    'Most Kills',
    'Most Assists',
    'Best Support',
    'Fan Favorite',
    'Clutch King',
    'Sniper God',
    'Entry Fragger',
    'Custom Award'
  ];

  useEffect(() => {
    if (initialDistribution.length > 0) {
      setDistribution(initialDistribution);
    } else {
      // Initialize with default positions
      setDistribution([
        { position: 1, amount: 0, percentage: 40 },
        { position: 2, amount: 0, percentage: 25 },
        { position: 3, amount: 0, percentage: 15 },
        { position: 4, amount: 0, percentage: 10 },
        { position: 5, amount: 0, percentage: 10 }
      ]);
    }
  }, [initialDistribution]);

  useEffect(() => {
    if (initialIndividualAwards.length > 0) {
      setIndividualAwards(initialIndividualAwards);
    } else {
      // Initialize with some default individual awards
      setIndividualAwards([
        { name: 'MVP', amount: 0, percentage: 5, description: 'Most Valuable Player' },
        { name: 'Best IGL', amount: 0, percentage: 3, description: 'Best In-Game Leader' }
      ]);
    }
  }, [initialIndividualAwards]);

  const calculateAmount = (percentage) => {
    return totalPrizePool ? Math.round((percentage / 100) * totalPrizePool) : 0;
  };

  const calculatePercentage = (amount) => {
    return totalPrizePool ? Math.round((amount / totalPrizePool) * 100) : 0;
  };

  const handlePositionChange = (index, field, value) => {
    const newDistribution = [...distribution];
    newDistribution[index][field] = parseFloat(value) || 0;

    // Auto-calculate the other field based on distribution type
    if (distributionType === 'percentage') {
      newDistribution[index].amount = calculateAmount(newDistribution[index].percentage);
    } else {
      newDistribution[index].percentage = calculatePercentage(newDistribution[index].amount);
    }

    setDistribution(newDistribution);
    validateDistribution(newDistribution);
  };

  const addPosition = () => {
    const nextPosition = distribution.length + 1;
    const newDistribution = [
      ...distribution,
      { position: nextPosition, amount: 0, percentage: 0 }
    ];
    setDistribution(newDistribution);
    validateDistribution(newDistribution);
  };

  const removePosition = (index) => {
    if (distribution.length <= 1) return; // Keep at least one position

    const newDistribution = distribution.filter((_, i) => i !== index);
    // Reorder positions
    newDistribution.forEach((item, i) => {
      item.position = i + 1;
    });
    setDistribution(newDistribution);
    validateDistribution(newDistribution);
  };

  const validateDistribution = (dist) => {
    const newErrors = {};

    if (distributionType === 'percentage') {
      const totalPercentage = dist.reduce((sum, item) => sum + (item.percentage || 0), 0);
      if (totalPercentage > 100) {
        newErrors.total = 'Total percentage cannot exceed 100%';
      }
    } else {
      const totalAmount = dist.reduce((sum, item) => sum + (item.amount || 0), 0);
      if (totalAmount > totalPrizePool) {
        newErrors.total = 'Total amount cannot exceed prize pool';
      }
    }

    setErrors(newErrors);
  };

  const handleSave = () => {
    if (Object.keys(errors).length > 0) return;

    const validDistribution = distribution.filter(item =>
      (distributionType === 'percentage' ? item.percentage > 0 : item.amount > 0)
    );

    const validIndividualAwards = individualAwards.filter(award =>
      award.name && award.name.trim() !== '' && (distributionType === 'percentage' ? award.percentage > 0 : award.amount > 0)
    );

    onSave(validDistribution, validIndividualAwards);
    onClose();
  };

  const getTotalPercentage = () => {
    return distribution.reduce((sum, item) => sum + (item.percentage || 0), 0);
  };

  const getTotalAmount = () => {
    return distribution.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const getIndividualAwardsTotalAmount = () => {
    return individualAwards.reduce((sum, award) => sum + (award.amount || 0), 0);
  };

  const getIndividualAwardsTotalPercentage = () => {
    return individualAwards.reduce((sum, award) => sum + (award.percentage || 0), 0);
  };

  const handleIndividualAwardChange = (index, field, value) => {
    const newAwards = [...individualAwards];
    newAwards[index][field] = value;

    // Auto-calculate the other field based on distribution type
    if (distributionType === 'percentage') {
      newAwards[index].amount = calculateAmount(newAwards[index].percentage);
    } else {
      newAwards[index].percentage = calculatePercentage(newAwards[index].amount);
    }

    setIndividualAwards(newAwards);
  };

  const addIndividualAward = (awardType = 'Custom Award') => {
    const newAwards = [
      ...individualAwards,
      {
        name: awardType,
        amount: 0,
        percentage: distributionType === 'percentage' ? 2 : 0,
        description: awardType === 'Custom Award' ? '' : `${awardType} Award`
      }
    ];
    setIndividualAwards(newAwards);
  };

  const removeIndividualAward = (index) => {
    const newAwards = individualAwards.filter((_, i) => i !== index);
    setIndividualAwards(newAwards);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-semibold text-white">Prize Distribution</h2>
            <p className="text-zinc-400 text-sm">Set up prize distribution for tournament positions</p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Prize Pool Info */}
        <div className="p-6 border-b border-zinc-800 bg-zinc-800/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Total Prize Pool</h3>
              <p className="text-2xl font-bold text-orange-500">
                ₹{totalPrizePool.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <h3 className="text-white font-medium">Distribution Type</h3>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setDistributionType('percentage')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    distributionType === 'percentage'
                      ? 'bg-orange-500 text-white'
                      : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
                  }`}
                >
                  <Percent size={14} className="inline mr-1" />
                  Percentage
                </button>
                <button
                  onClick={() => setDistributionType('fixed')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    distributionType === 'fixed'
                      ? 'bg-orange-500 text-white'
                      : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
                  }`}
                >
                  <DollarSign size={14} className="inline mr-1" />
                  Fixed Amount
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Distribution Form */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="space-y-4">
            {distribution.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-lg">
                <div className="w-16">
                  <div className="flex items-center gap-1">
                    <Trophy size={16} className="text-yellow-500" />
                    <span className="text-white font-medium">{item.position}</span>
                    <span className="text-zinc-400 text-sm">
                      {item.position === 1 ? 'st' : item.position === 2 ? 'nd' : item.position === 3 ? 'rd' : 'th'}
                    </span>
                  </div>
                </div>

                <div className="flex-1">
                  {distributionType === 'percentage' ? (
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">Percentage</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={item.percentage}
                        onChange={(e) => handlePositionChange(index, 'percentage', e.target.value)}
                        className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">Amount (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={item.amount}
                        onChange={(e) => handlePositionChange(index, 'amount', e.target.value)}
                        className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  )}
                </div>

                <div className="w-32">
                  <div className="text-sm text-zinc-400">Receives</div>
                  <div className="text-white font-medium">
                    ₹{item.amount.toLocaleString()}
                  </div>
                </div>

                {distribution.length > 1 && (
                  <button
                    onClick={() => removePosition(index)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add Position Button */}
          <button
            onClick={addPosition}
            className="w-full mt-4 py-3 border-2 border-dashed border-zinc-600 rounded-lg text-zinc-400 hover:border-orange-500 hover:text-orange-500 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add Position
          </button>

          {/* Individual Awards Section */}
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Individual Awards</h3>
                {individualAwards.length > 0 && (
                  <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs">
                    {individualAwards.length} award{individualAwards.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {awardTypes.slice(0, 5).map((awardType) => (
                  <button
                    key={awardType}
                    onClick={() => addIndividualAward(awardType)}
                    className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded text-sm hover:bg-purple-500/30 transition-colors"
                  >
                    + {awardType}
                  </button>
                ))}
                <button
                  onClick={() => addIndividualAward('Custom Award')}
                  className="px-3 py-1 bg-zinc-700 text-zinc-400 rounded text-sm hover:bg-zinc-600 transition-colors"
                >
                  + Custom
                </button>
              </div>
            </div>

            {individualAwards.length > 0 && (
              <div className="space-y-3">
                {individualAwards.map((award, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-zinc-800/30 rounded-lg">
                    <div className="w-20">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-purple-400" />
                        <span className="text-white font-medium text-sm">{award.name}</span>
                      </div>
                    </div>

                    <div className="flex-1">
                      <input
                        type="text"
                        value={award.name}
                        onChange={(e) => handleIndividualAwardChange(index, 'name', e.target.value)}
                        placeholder="Award name"
                        className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                    </div>

                    <div className="w-24">
                      {distributionType === 'percentage' ? (
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">%</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={award.percentage}
                            onChange={(e) => handleIndividualAwardChange(index, 'percentage', e.target.value)}
                            className="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">₹</label>
                          <input
                            type="number"
                            min="0"
                            value={award.amount}
                            onChange={(e) => handleIndividualAwardChange(index, 'amount', e.target.value)}
                            className="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          />
                        </div>
                      )}
                    </div>

                    <div className="w-28">
                      <div className="text-xs text-zinc-400">Receives</div>
                      <div className="text-white font-medium text-sm">
                        ₹{award.amount.toLocaleString()}
                      </div>
                    </div>

                    <button
                      onClick={() => removeIndividualAward(index)}
                      className="text-red-400 hover:text-red-300 transition-colors p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Individual Awards Summary */}
            {individualAwards.length > 0 && (
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-zinc-400">Awards Total:</span>
                    <div className="text-white font-medium">
                      {distributionType === 'percentage'
                        ? `${getIndividualAwardsTotalPercentage().toFixed(1)}%`
                        : `₹${getIndividualAwardsTotalAmount().toLocaleString()}`
                      }
                    </div>
                  </div>
                  <div>
                    <span className="text-zinc-400">Avg per Award:</span>
                    <div className="text-white font-medium">
                      {distributionType === 'percentage'
                        ? `${individualAwards.length > 0 ? (getIndividualAwardsTotalPercentage() / individualAwards.length).toFixed(1) : 0}%`
                        : `₹${individualAwards.length > 0 ? Math.round(getIndividualAwardsTotalAmount() / individualAwards.length).toLocaleString() : 0}`
                      }
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-zinc-400">Total {distributionType === 'percentage' ? 'Percentage' : 'Amount'}:</span>
                <div className="text-white font-medium">
                  {distributionType === 'percentage'
                    ? `${getTotalPercentage().toFixed(1)}%`
                    : `₹${getTotalAmount().toLocaleString()}`
                  }
                </div>
              </div>
              <div>
                <span className="text-zinc-400">Remaining:</span>
                <div className="text-white font-medium">
                  {distributionType === 'percentage'
                    ? `${Math.max(0, 100 - getTotalPercentage()).toFixed(1)}%`
                    : `₹${Math.max(0, totalPrizePool - getTotalAmount()).toLocaleString()}`
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Errors */}
          {errors.total && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} className="text-red-400" />
              <span className="text-red-400 text-sm">{errors.total}</span>
            </div>
          )}
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
            Save Distribution
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrizeDistributionForm;
