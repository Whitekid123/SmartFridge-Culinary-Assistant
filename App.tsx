
import React, { useState, useRef } from 'react';
import { 
  AppState, 
  Recipe, 
  DietaryRestriction, 
  Difficulty 
} from './types';
import { analyzeFridgeImage, getRecipeSuggestions, speakStep } from './services/geminiService';

const Sidebar: React.FC<{
  activeFilters: DietaryRestriction[];
  onToggleFilter: (filter: DietaryRestriction) => void;
  onGoToShopping: () => void;
  onGoToHome: () => void;
  shoppingCount: number;
  currentView: string;
}> = ({ activeFilters, onToggleFilter, onGoToShopping, onGoToHome, shoppingCount, currentView }) => {
  return (
    <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 h-screen sticky top-0 p-8 shadow-sm">
      <div 
        onClick={onGoToHome}
        className="flex items-center gap-3 mb-12 cursor-pointer group"
      >
        <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100 group-hover:scale-105 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">SmartFridge</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Culinary Assistant</p>
        </div>
      </div>

      <nav className="flex-1">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">Dietary Preferences</h3>
        <div className="space-y-1">
          {Object.values(DietaryRestriction).map((filter) => (
            <button
              key={filter}
              onClick={() => onToggleFilter(filter)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeFilters.includes(filter)
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {filter}
              {activeFilters.includes(filter) && (
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </button>
          ))}
        </div>
      </nav>

      <div className="mt-auto">
        <button 
          onClick={onGoToShopping}
          className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all duration-300 ${
            currentView === 'shopping' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="font-bold text-sm">Shopping List</span>
          </div>
          {shoppingCount > 0 && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              currentView === 'shopping' ? 'bg-emerald-500 text-white' : 'bg-emerald-600 text-white'
            }`}>
              {shoppingCount}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};

const RecipeCard: React.FC<{ 
  recipe: Recipe; 
  onSelect: (r: Recipe) => void 
}> = ({ recipe, onSelect }) => {
  return (
    <div 
      onClick={() => onSelect(recipe)}
      className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-pointer border border-gray-100 flex flex-col h-full group"
    >
      <div className="relative h-56 overflow-hidden">
        <img 
          src={`https://picsum.photos/seed/${recipe.id}/600/400`} 
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
          <span className="text-white text-sm font-bold">Start Cooking →</span>
        </div>
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {recipe.dietaryTags.map(tag => (
            <span key={tag} className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black text-emerald-800 uppercase tracking-wider shadow-sm">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="p-7 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-xl text-gray-900 leading-tight group-hover:text-emerald-700 transition-colors">{recipe.title}</h3>
        </div>
        <p className="text-gray-500 text-sm line-clamp-2 mb-6 leading-relaxed flex-1">
          {recipe.description}
        </p>
        <div className="flex items-center justify-between pt-6 border-t border-gray-50">
          <div className="flex items-center gap-4">
             <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Time</span>
                <span className="text-sm font-bold text-gray-700">{recipe.prepTime}m</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Calories</span>
                <span className="text-sm font-bold text-gray-700">{recipe.calories}</span>
             </div>
          </div>
          <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
            recipe.difficulty === Difficulty.EASY ? 'bg-emerald-50 text-emerald-600' :
            recipe.difficulty === Difficulty.MEDIUM ? 'bg-orange-50 text-orange-600' :
            'bg-rose-50 text-rose-600'
          }`}>
            {recipe.difficulty}
          </span>
        </div>
      </div>
    </div>
  );
};

const CookingMode: React.FC<{
  recipe: Recipe;
  onClose: () => void;
  onAddToShopping: (item: string) => void;
  shoppingList: string[];
}> = ({ recipe, onClose, onAddToShopping, shoppingList }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = async () => {
    setIsSpeaking(true);
    await speakStep(recipe.steps[currentStep]);
    setIsSpeaking(false);
  };

  const nextStep = () => {
    if (currentStep < recipe.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col lg:flex-row overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-full lg:w-96 bg-gray-50 border-r border-gray-100 p-10 flex flex-col overflow-y-auto custom-scrollbar">
        <button onClick={onClose} className="mb-12 flex items-center gap-3 text-gray-400 font-bold text-xs uppercase tracking-[0.2em] hover:text-gray-900 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Exit Cooking
        </button>
        
        <h2 className="text-4xl font-black text-gray-900 mb-8 leading-tight">{recipe.title}</h2>
        
        <div className="mb-12">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Ingredients List</h3>
          <ul className="space-y-5">
            {recipe.ingredients.map((ing, idx) => (
              <li key={idx} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full border-2 ${ing.isOwned ? 'bg-emerald-500 border-emerald-100' : 'bg-rose-500 border-rose-100'}`} />
                  <span className={`text-sm font-semibold transition-all ${!ing.isOwned ? 'text-rose-600 italic' : 'text-gray-700'}`}>
                    {ing.amount} <span className="font-bold uppercase tracking-tight ml-1">{ing.name}</span>
                  </span>
                </div>
                {!ing.isOwned && (
                  <button 
                    onClick={() => onAddToShopping(ing.name)}
                    disabled={shoppingList.includes(ing.name)}
                    className={`p-2 rounded-xl transition-all ${
                        shoppingList.includes(ing.name) 
                        ? 'bg-emerald-100 text-emerald-600' 
                        : 'bg-rose-50 text-rose-600 hover:bg-rose-100 active:scale-90'
                    }`}
                  >
                    {shoppingList.includes(ing.name) ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    )}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex-1 p-10 lg:p-24 flex flex-col justify-center items-center relative bg-white overflow-hidden">
        <div className="max-w-4xl w-full">
          <div className="mb-12 flex items-center justify-between">
             <div className="flex flex-col">
                <span className="text-emerald-600 font-black uppercase tracking-[0.3em] text-xs mb-2">Instructions</span>
                <span className="text-gray-300 font-bold text-2xl">Step {currentStep + 1} / {recipe.steps.length}</span>
             </div>
             <div className="h-2 w-48 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${((currentStep + 1) / recipe.steps.length) * 100}%` }} />
             </div>
          </div>
          
          <div className="min-h-[300px] flex items-center justify-center">
            <h1 className="text-4xl lg:text-7xl font-black text-gray-900 leading-[1.15] text-center mb-20 animate-in fade-in slide-in-from-bottom-2 duration-700">
                {recipe.steps[currentStep]}
            </h1>
          </div>
          
          <div className="flex items-center justify-center gap-10">
            <button 
              onClick={prevStep}
              disabled={currentStep === 0}
              className="w-20 h-20 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 transition-all active:scale-90"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>

            <button 
              onClick={handleSpeak}
              disabled={isSpeaking}
              className={`w-32 h-32 rounded-full shadow-2xl shadow-emerald-200 flex items-center justify-center transition-all duration-500 group ${isSpeaking ? 'bg-emerald-100 text-emerald-600 scale-95' : 'bg-emerald-600 text-white hover:scale-110 active:scale-90'}`}
            >
              <div className="relative">
                {isSpeaking && <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />}
                <svg className="w-14 h-14 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>
              </div>
            </button>

            <button 
              onClick={nextStep}
              disabled={currentStep === recipe.steps.length - 1}
              className="w-20 h-20 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 transition-all active:scale-90"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
        </div>

        <div className="absolute bottom-12 text-[10px] font-bold text-gray-300 uppercase tracking-[0.4em]">
          Hands-Free Mode Enabled
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [state, setState] = useState<AppState>({
    view: 'landing',
    capturedImage: null,
    foundIngredients: [],
    suggestedRecipes: [],
    selectedRecipe: null,
    shoppingList: [],
    filters: [],
    isAnalyzing: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setState(prev => ({ ...prev, capturedImage: base64, isAnalyzing: true, view: 'fridge' }));
      try {
        const ingredients = await analyzeFridgeImage(base64);
        setState(prev => ({ ...prev, foundIngredients: ingredients, isAnalyzing: false }));
      } catch (error) {
        console.error("Analysis failed:", error);
        setState(prev => ({ ...prev, isAnalyzing: false }));
      }
    };
    reader.readAsDataURL(file);
  };

  const findRecipes = async () => {
    setState(prev => ({ ...prev, isAnalyzing: true }));
    try {
      const recipes = await getRecipeSuggestions(state.foundIngredients, state.filters);
      setState(prev => ({ ...prev, suggestedRecipes: recipes, isAnalyzing: false, view: 'recipes' }));
    } catch (error) {
      console.error("Recipe retrieval failed:", error);
      setState(prev => ({ ...prev, isAnalyzing: false }));
    }
  };

  const toggleFilter = (filter: DietaryRestriction) => {
    setState(prev => ({
      ...prev,
      filters: prev.filters.includes(filter) 
        ? prev.filters.filter(f => f !== filter)
        : [...prev.filters, filter]
    }));
  };

  const addToShopping = (item: string) => {
    setState(prev => ({
      ...prev,
      shoppingList: prev.shoppingList.includes(item) ? prev.shoppingList : [...prev.shoppingList, item]
    }));
  };

  const renderView = () => {
    switch (state.view) {
      case 'landing':
        return (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] text-center px-6">
            <div className="relative mb-12">
              <div className="absolute -inset-4 bg-emerald-100 rounded-[3rem] blur-2xl opacity-60 animate-pulse" />
              <div className="relative w-24 h-24 bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center text-emerald-600">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 max-w-3xl leading-[1.1]">
              Stop guessing, <br/><span className="text-emerald-600">start cooking.</span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 max-w-xl font-medium leading-relaxed">
              Our AI vision assistant scans your fridge and creates gourmet recipes tailored to what you already have.
            </p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-900 hover:bg-black text-white px-12 py-6 rounded-[2rem] font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
            >
              Analyze My Fridge
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
            <input type="file" accept="image/*" capture="environment" ref={fileInputRef} className="hidden" onChange={handleCapture} />
          </div>
        );

      case 'fridge':
        return (
          <div className="max-w-6xl mx-auto py-16 px-6">
            <div className="flex flex-col lg:flex-row gap-16 items-center lg:items-start">
              <div className="w-full lg:w-1/2 group">
                <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white group-hover:scale-[1.02] transition-transform duration-500">
                   <img src={state.capturedImage || ''} alt="Fridge" className="w-full h-auto aspect-[3/4] object-cover" />
                   {state.isAnalyzing && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                         <div className="flex flex-col items-center gap-6">
                            <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                            <p className="text-white font-black uppercase tracking-widest text-sm">Identifying ingredients...</p>
                         </div>
                      </div>
                   )}
                </div>
              </div>
              <div className="w-full lg:w-1/2 flex flex-col justify-center">
                <div className="mb-10">
                   <span className="text-emerald-600 font-black uppercase tracking-[0.2em] text-xs mb-4 block">Visual Scan Results</span>
                   <h2 className="text-4xl font-black text-gray-900 mb-6 leading-tight">Here's what we found inside.</h2>
                </div>
                
                {state.isAnalyzing ? (
                  <div className="space-y-4">
                     {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-2xl animate-pulse" />)}
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-3 mb-12">
                      {state.foundIngredients.map((item, idx) => (
                        <div key={idx} className="bg-white border-2 border-gray-50 px-5 py-3 rounded-2xl text-sm font-bold text-gray-700 shadow-sm flex items-center gap-2 animate-in zoom-in-95 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                          <span className="text-emerald-500">•</span> {item}
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col gap-4">
                       <button onClick={findRecipes} className="w-full bg-emerald-600 text-white py-6 rounded-[2rem] font-black text-lg shadow-xl shadow-emerald-100 hover:bg-emerald-700 hover:scale-105 transition-all">
                          Generate Chef Recipes
                       </button>
                       <button onClick={() => setState(prev => ({ ...prev, view: 'landing' }))} className="text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-gray-900 transition-colors">
                          Retake Scanning Photo
                       </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );

      case 'recipes':
        return (
          <div className="max-w-7xl mx-auto py-16 px-6">
            <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <span className="text-emerald-600 font-black uppercase tracking-[0.2em] text-xs mb-4 block">AI Recommendations</span>
                <h2 className="text-5xl font-black text-gray-900">Today's Specials.</h2>
              </div>
              <div className="flex items-center gap-3">
                 {state.filters.map(f => (
                   <span key={f} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">{f}</span>
                 ))}
              </div>
            </header>

            {state.isAnalyzing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-white rounded-[2rem] h-[450px] animate-pulse p-8">
                    <div className="h-48 bg-gray-50 rounded-2xl mb-6" />
                    <div className="h-6 bg-gray-50 w-3/4 mb-4" />
                    <div className="h-4 bg-gray-50 w-full mb-2" />
                    <div className="h-4 bg-gray-50 w-5/6" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {state.suggestedRecipes.map(recipe => (
                  <RecipeCard key={recipe.id} recipe={recipe} onSelect={(r) => setState(prev => ({ ...prev, selectedRecipe: r, view: 'cooking' }))} />
                ))}
              </div>
            )}
          </div>
        );

      case 'shopping':
        return (
          <div className="max-w-3xl mx-auto py-16 px-6">
            <h2 className="text-5xl font-black text-gray-900 mb-12">Essential Pantry.</h2>
            {state.shoppingList.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-[3rem] border-4 border-dashed border-gray-100">
                <p className="text-gray-300 font-bold text-lg">Your list is clear. You're ready to cook!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {state.shoppingList.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-7 bg-white rounded-[2rem] border border-gray-50 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-center gap-4">
                       <div className="w-8 h-8 rounded-full border-2 border-emerald-100 flex items-center justify-center text-emerald-500 font-black">✓</div>
                       <span className="font-bold text-gray-800 text-lg uppercase tracking-tight">{item}</span>
                    </div>
                    <button onClick={() => setState(prev => ({ ...prev, shoppingList: prev.shoppingList.filter(i => i !== item) }))} className="text-gray-200 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex bg-[#fbfcfd]">
      {state.view !== 'cooking' && (
        <Sidebar 
          activeFilters={state.filters} 
          onToggleFilter={toggleFilter} 
          onGoToShopping={() => setState(prev => ({ ...prev, view: 'shopping' }))}
          onGoToHome={() => setState(prev => ({ ...prev, view: 'landing' }))}
          shoppingCount={state.shoppingList.length}
          currentView={state.view}
        />
      )}

      <main className="flex-1 overflow-y-auto custom-scrollbar">
        {state.view !== 'landing' && state.view !== 'cooking' && (
          <nav className="sticky top-0 z-50 bg-white/60 backdrop-blur-xl border-b border-gray-100 px-8 py-6 flex items-center justify-between">
            <div className="lg:hidden flex items-center gap-3">
               <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">S</div>
               <span className="font-black text-gray-900 tracking-tight">SmartFridge</span>
            </div>
            
            <div className="flex items-center gap-6 ml-auto">
              {state.view === 'recipes' && (
                <button onClick={() => setState(prev => ({ ...prev, view: 'fridge' }))} className="text-xs font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700">
                  Refine Search
                </button>
              )}
              {state.view !== 'landing' && (
                 <button onClick={() => setState(prev => ({ ...prev, view: 'landing', capturedImage: null }))} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                 </button>
              )}
            </div>
          </nav>
        )}

        {renderView()}

        {state.view === 'cooking' && state.selectedRecipe && (
          <CookingMode 
            recipe={state.selectedRecipe} 
            shoppingList={state.shoppingList}
            onClose={() => setState(prev => ({ ...prev, view: 'recipes', selectedRecipe: null }))} 
            onAddToShopping={addToShopping}
          />
        )}
      </main>
    </div>
  );
}
