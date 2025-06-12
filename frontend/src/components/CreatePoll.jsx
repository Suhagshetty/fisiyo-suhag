import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, Plus, Trash2, ArrowLeft, Check, Loader2 } from "lucide-react";
import axios from "axios";
import WheelPicker from "./WheelPicker"; 

const MAX_QUESTION_LENGTH = 300;
const MAX_OPTION_LENGTH = 100;
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;

const CreatePoll = ({
  isModal = true,
  onClose,
  onSubmit,
  backgroundLocation,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentUser = location.state?.user;
  const community = location.state?.community.name;
  const community_dp = location.state?.community.url;
  const community_id = location.state?.community.id;

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [pollType, setPollType] = useState("standard");
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(false);
  const [showVotesBeforeExpire, setShowVotesBeforeExpire] = useState(true);
  const [showCorrectOption, setShowCorrectOption] = useState(false);
  const [correctOptionIndexes, setCorrectOptionIndexes] = useState([]);
  const [expirationDays, setExpirationDays] = useState(3);
  const [expirationHours, setExpirationHours] = useState(0); 

  const optionRefs = useRef([]);

  const validateForm = () => {
    const newErrors = {};

    if (!question.trim()) {
      newErrors.question = "Question is required";
    } else if (question.length > MAX_QUESTION_LENGTH) {
      newErrors.question = `Question must be less than ${MAX_QUESTION_LENGTH} characters`;
    }

    const optionErrors = [];
    let hasEmptyOption = false;

    options.forEach((option, index) => {
      if (!option.trim()) {
        optionErrors[index] = "Option cannot be empty";
        hasEmptyOption = true;
      } else if (option.length > MAX_OPTION_LENGTH) {
        optionErrors[
          index
        ] = `Option must be less than ${MAX_OPTION_LENGTH} characters`;
      }
    });

    if (hasEmptyOption) {
      newErrors.options = optionErrors;
    }

    if (options.length < MIN_OPTIONS) {
      newErrors.optionsCount = `Minimum ${MIN_OPTIONS} options required`;
    }

    // Validate quiz-specific settings
    if (pollType === "quiz") {
      if (correctOptionIndexes.length === 0) {
        newErrors.quiz = "At least one correct option must be selected";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleQuestionChange = useCallback((e) => {
    setQuestion(e.target.value);
    setErrors((prev) => (prev.question ? { ...prev, question: null } : prev));
  }, []);

  const handleOptionChange = useCallback(
    (index, value) => {
      setOptions((prev) => {
        const newOptions = [...prev];
        newOptions[index] = value;
        return newOptions;
      });

      // Clear error for this option if it exists
      if (errors.options?.[index]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          if (newErrors.options) {
            newErrors.options[index] = null;
            // Remove options error if all are valid
            if (Object.values(newErrors.options).every((e) => !e)) {
              delete newErrors.options;
            }
          }
          return newErrors;
        });
      }
    },
    [errors]
  );

  const addOption = useCallback(() => {
    if (options.length >= MAX_OPTIONS) {
      setErrors((prev) => ({
        ...prev,
        optionsCount: `Maximum ${MAX_OPTIONS} options allowed`,
      }));
      return;
    }
    setOptions((prev) => [...prev, ""]);
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.optionsCount;
      return newErrors;
    });
  }, [options.length]);

  const removeOption = useCallback(
    (index) => {
      if (options.length <= MIN_OPTIONS) {
        setErrors((prev) => ({
          ...prev,
          optionsCount: `Minimum ${MIN_OPTIONS} options required`,
        }));
        return;
      }

      // Remove from correct indexes if needed
      if (correctOptionIndexes.includes(index)) {
        setCorrectOptionIndexes((prev) =>
          prev.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i))
        );
      }

      setOptions((prev) => {
        const newOptions = [...prev];
        newOptions.splice(index, 1);
        return newOptions;
      });

      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.optionsCount;

        if (newErrors.options?.[index]) {
          delete newErrors.options[index];
          if (Object.keys(newErrors.options).length === 0) {
            delete newErrors.options;
          }
        }

        return newErrors;
      });
    },
    [options.length, correctOptionIndexes]
  );

  const toggleCorrectOption = useCallback((index) => {
    setCorrectOptionIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  }, []);

  const handleExpirationDaysChange = (e) => {
    const days = parseInt(e.target.value) || 0;
    setExpirationDays(Math.max(0, Math.min(30, days)));
  };

  const handleExpirationHoursChange = (e) => {
    const hours = parseInt(e.target.value) || 0;
    setExpirationHours(Math.max(0, Math.min(23, hours)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Calculate expiration time
      const totalHours = expirationDays * 24 + expirationHours;
      const expiresAt = new Date(Date.now() + totalHours * 60 * 60 * 1000);

      const pollData = {
        question: question.trim(),
        options: options
          .filter((opt) => opt.trim())
          .map((opt, index) => ({
            text: opt.trim(),
            votes: [],
            isCorrect: correctOptionIndexes.includes(index),
          })),
        author: currentUser._id,
        userHandle: currentUser.handle,
        community: community_id,
        communityHandle: community,
        community_dp: community_dp,
        totalVotes: 0,
        votedUsers: [],
        pollType,
        allowMultipleVotes,
        showVotesBeforeExpire,
        expiresAt,
        // Quiz-specific fields
        ...(pollType === "quiz" && {
          correctOptionIndexes,
          showCorrectOption,
        }), 
      };

      const response = await axios.post(
        "http://localhost:3000/api/polls/create-poll",
        pollData
      );

      console.log("Poll submitted to DB:", response.data);

      resetForm();
      handleClose();
    } catch (error) {
      console.error(
        "Error submitting poll:",
        error.response?.data || error.message
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setQuestion("");
    setOptions(["", ""]);
    setErrors({});
    setPollType("standard");
    setAllowMultipleVotes(false);
    setShowVotesBeforeExpire(true);
    setShowCorrectOption(false);
    setCorrectOptionIndexes([]);
    setExpirationDays(3);
    setExpirationHours(0); 
  };

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      if (backgroundLocation) {
        navigate(backgroundLocation.pathname, {
          state: { user: currentUser },
        });
      } else {
        navigate("/feed", { state: { user: currentUser } });
      }
    }
  }, [onClose, backgroundLocation, navigate, currentUser]);

  const handleBackdropClick = (e) => {
    if (isModal && e.target === e.currentTarget) {
      handleClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  useEffect(() => {
    // Focus the last option when a new one is added
    if (options.length > 2 && optionRefs.current[options.length - 1]) {
      optionRefs.current[options.length - 1].focus();
    }
  }, [options.length]);

  const createPollContent = () => (
    <div
      className={`bg-[#0A0A0A] ${
        isModal ? "rounded-2xl border border-[#1E1E1E] shadow-2xl" : ""
      } w-full ${isModal ? "max-w-3xl max-h-[90vh]" : "min-h-screen"} ${
        isModal ? "overflow-y-auto" : "overflow-y-auto"
      }`}>
      {/* Header */}
      <div
        className={`${
          isModal
            ? "p-6 border-b border-[#1E1E1E]"
            : "p-6 border-b border-[#1E1E1E]"
        } flex justify-between items-center sticky top-0 bg-[#0A0A0A] z-10`}>
        <div className="flex items-center gap-3">
          <img
            className="w-12 h-12  object-cover object-center"
            src={community_dp}
            alt="community"
          />
          <div className="flex flex-col">
            <h2 className="text-white font-medium text-base">c/{community}</h2>
            <p className="text-[#818384] text-sm">Create Poll</p>
          </div>
        </div>

        <button
          onClick={handleClose}
          className="text-[#818384] hover:text-white p-2 rounded-full transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className={`${isModal ? "p-6" : "p-6"}`}>
        <form onSubmit={handleSubmit}>
          {/* Question Input */}
          <div className="mb-2">
            <label className="block text-white font-medium mb-3 text-lg">
              Poll Question
            </label>
            <textarea
              placeholder="What would you like to ask?"
              className={`w-full bg-[#161617] border ${
                errors.question ? "border-red-500" : "border-[#1E1E1E]"
              } rounded-xl px-4 py-2 text-white placeholder-[#818384] min-h-[120px] focus:outline-none focus:border-[#AD49E1]/50 transition-colors resize-none`}
              value={question}
              onChange={handleQuestionChange}
            />
            <div className="mt-2 flex justify-between text-sm">
              {errors.question ? (
                <span className="text-red-500">{errors.question}</span>
              ) : (
                <span>&nbsp;</span>
              )}
              <span className="text-[#818384]">
                {question.length}/{MAX_QUESTION_LENGTH}
              </span>
            </div>
          </div>

          {/* Poll Type Selection */}
          <div className="mb-6">
            <h3 className="font-medium text-white mb-2 text-lg">Poll Type</h3>
            <div className="flex gap-6">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  className="form-radio text-[#AD49E1] bg-[#161617] border-[#1E1E1E] focus:ring-[#AD49E1] focus:ring-2"
                  checked={pollType === "standard"}
                  onChange={() => setPollType("standard")}
                />
                <span className="ml-3 text-[#d7dadc]">Standard Poll</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  className="form-radio text-[#AD49E1] bg-[#161617] border-[#1E1E1E] focus:ring-[#AD49E1] focus:ring-2"
                  checked={pollType === "quiz"}
                  onChange={() => setPollType("quiz")}
                />
                <span className="ml-3 text-[#d7dadc]">Quiz</span>
              </label>
            </div>
          </div>

          {/* Poll Options */}
          <div className="mb-4">
            <h3 className="font-medium text-white mb-4 text-lg">
              Poll Options
            </h3>

            {options.map((option, index) => (
              <div key={index} className="flex items-start gap-3 mb-4">
                <div className="flex-1 relative">
                  <div className="flex items-center">
                    <input
                      type="text"
                      placeholder={`Option ${index + 1}`}
                      className={`w-full bg-[#161617] border ${
                        errors.options?.[index]
                          ? "border-red-500"
                          : "border-[#1E1E1E]"
                      } rounded-xl px-4 py-3 text-white placeholder-[#818384] focus:outline-none focus:border-[#AD49E1]/50 transition-colors`}
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      ref={(el) => (optionRefs.current[index] = el)}
                    />
                    {pollType === "quiz" && (
                      <button
                        type="button"
                        onClick={() => toggleCorrectOption(index)}
                        className={`ml-3 p-2 rounded-full transition-colors ${
                          correctOptionIndexes.includes(index)
                            ? "bg-green-500/20 text-green-400"
                            : "text-[#818384] hover:text-green-400 hover:bg-green-500/10"
                        }`}
                        aria-label={
                          correctOptionIndexes.includes(index)
                            ? "Mark as incorrect"
                            : "Mark as correct"
                        }>
                        <Check size={18} />
                      </button>
                    )}
                  </div>
                  {errors.options?.[index] && (
                    <p className="mt-2 text-sm text-red-500">
                      {errors.options[index]}
                    </p>
                  )}
                </div>

                {options.length > MIN_OPTIONS && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="text-[#818384] hover:text-red-400 p-2 rounded-full hover:bg-red-500/10 transition-colors mt-1"
                    aria-label="Remove option">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}

            <div className="mt-4 flex justify-between items-center">
              {errors.optionsCount ? (
                <span className="text-red-500 text-sm">
                  {errors.optionsCount}
                </span>
              ) : (
                <span>&nbsp;</span>
              )}

              <span className="text-sm text-[#818384]">
                {options.length}/{MAX_OPTIONS}
              </span>
            </div>

            {options.length < MAX_OPTIONS && (
              <button
                type="button"
                onClick={addOption}
                className="mt-4 flex items-center text-[#AD49E1] hover:text-[#AD49E1]/80 font-medium text-sm bg-[#AD49E1]/10 hover:bg-[#AD49E1]/20 px-4 py-2 rounded-full transition-colors">
                <Plus size={16} className="mr-2" />
                Add Option
              </button>
            )}

            {errors.quiz && (
              <p className="text-red-500 text-sm mt-3">{errors.quiz}</p>
            )}
          </div>

          {/* Quiz Settings */}
          {pollType === "quiz" && (
            <div className="mb-8 bg-[#161617] border border-[#1E1E1E] p-6 rounded-xl">
              <h3 className="font-medium text-white mb-4 text-lg">
                Quiz Settings
              </h3>

              <label className="flex items-center mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox text-[#AD49E1] bg-[#0A0A0A] border-[#1E1E1E] rounded focus:ring-[#AD49E1] focus:ring-2"
                  checked={showCorrectOption}
                  onChange={(e) => setShowCorrectOption(e.target.checked)}
                />
                <span className="ml-3 text-[#d7dadc]">
                  Show correct option after voting
                </span>
              </label>

              <p className="text-sm text-[#818384] mt-2">
                {correctOptionIndexes.length} correct option(s) selected
              </p>
            </div>
          )}

          {/* Expiration Settings */}
          <div className="mb-8 bg-[#161617] border border-[#1E1E1E] p-6 rounded-xl">
            <h3 className="font-medium text-white mb-4 text-lg flex items-center gap-2">
              Expiration Settings
            </h3>
            <div className="space-y-3">
              <h3 className="text-sm text-white font-semibold">
                Set Poll Expiration
              </h3>
              <div className="flex gap-6 justify-center">
                {/* Days Picker */}
                <div className="flex flex-col items-center">
                  <label className="text-xs text-[#aeb0b4] mb-1">Days</label>
                  <div className="bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg overflow-hidden w-20 h-32 flex items-center">
                    <WheelPicker
                      options={Array.from({ length: 31 }, (_, i) =>
                        i.toString()
                      )}
                      value={expirationDays.toString()}
                      onChange={(val) => setExpirationDays(parseInt(val))}
                      unit="d"
                    />
                  </div>
                </div>

                {/* Hours Picker */}
                <div className="flex flex-col items-center">
                  <label className="text-xs text-[#aeb0b4] mb-1">Hours</label>
                  <div className="bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg overflow-hidden w-20 h-32 flex items-center">
                    <WheelPicker
                      options={Array.from({ length: 24 }, (_, i) =>
                        i.toString()
                      )}
                      value={expirationHours.toString()}
                      onChange={(val) => setExpirationHours(parseInt(val))}
                      unit="h"
                    />
                  </div>
                </div>
              </div>

              <p className="text-xs text-purple-400 text-center">
                Scroll to set when your poll expires (default: 3 days)
              </p>
            </div>
          </div>

          {/* Poll Settings */}
          <div className="mb-8 bg-[#161617] border border-[#1E1E1E] p-6 rounded-xl">
            <h3 className="font-medium text-white mb-4 text-lg">
              Poll Settings
            </h3>

            <div className="space-y-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox text-[#AD49E1] bg-[#0A0A0A] border-[#1E1E1E] rounded focus:ring-[#AD49E1] focus:ring-2"
                  checked={allowMultipleVotes}
                  onChange={(e) => setAllowMultipleVotes(e.target.checked)}
                />
                <span className="ml-3 text-[#d7dadc]">
                  Allow multiple votes
                </span>
              </label>

              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox text-[#AD49E1] bg-[#0A0A0A] border-[#1E1E1E] rounded focus:ring-[#AD49E1] focus:ring-2"
                  checked={showVotesBeforeExpire}
                  onChange={(e) => setShowVotesBeforeExpire(e.target.checked)}
                />
                <span className="ml-3 text-[#d7dadc]">
                  Show votes before poll expires
                </span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 pb-4 border-t border-[#1E1E1E] flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center gap-2 font-medium py-3 px-8 rounded-full transition-all ${
                isSubmitting
                  ? "bg-[#AD49E1]/50 text-white cursor-not-allowed"
                  : "bg-[#AD49E1] hover:bg-[#AD49E1]/90 text-white"
              }`}>
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  Creating Poll...
                </>
              ) : (
                "Create Poll"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div
        className="fixed inset-0 bg-[#AD49E1]/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}>
        {createPollContent()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303] flex items-start justify-center pt-8">
      {createPollContent()}
    </div>
  );
};

export default CreatePoll;
