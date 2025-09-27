import React, { useEffect, useState } from 'react';
import { MessageSquare, Send, Filter, IndianRupee, BookOpen, Users, Bus, Building2, Trophy } from 'lucide-react';
import { getChatbotQuestions, chatbotFilter } from '../api/chatbotService';

const feeRanges = [
    '1000 - 10000',
    '10000 - 25000',
    '25000 - 50000',
    '50000 - 75000',
    '75000 - 100000',
    '1 Lakh - 2 Lakh',
    '2 Lakh - 3 Lakh',
    '3 Lakh - 4 Lakh',
    '4 Lakh - 5 Lakh',
    'More than 5 Lakh'
];

const boards = ['CBSE', 'ICSE', 'STATE', 'OTHER'];
const types = ['convent', 'private', 'government'];
const genders = ['boy', 'girl', 'co-ed'];
const transportOptions = ['yes', 'no'];
const ranks = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D'];

const Chip = ({ active, children, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-full border text-sm ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-800 border-gray-300'} hover:border-blue-500`}
    >
        {children}
    </button>
);

const Section = ({ title, icon, children }) => (
    <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">{icon}{title}</h3>
        <div className="flex flex-wrap gap-3">
            {children}
        </div>
    </div>
);

const ChatbotPage = () => {
	const [questions, setQuestions] = useState([]);
	const [input, setInput] = useState('');
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(false);
	const [toast, setToast] = useState('');
	const [results, setResults] = useState([]);

	const [inputEl, setInputEl] = useState(null);

	// chip selections
	const [selFee, setSelFee] = useState([]);
	const [selBoards, setSelBoards] = useState([]);
	const [selTypes, setSelTypes] = useState([]);
	const [selGender, setSelGender] = useState('');
	const [selTransport, setSelTransport] = useState('');
	const [onlyArea, setOnlyArea] = useState(false);
	const [onlyCity, setOnlyCity] = useState(false);
	const [selRanks, setSelRanks] = useState([]);

	useEffect(() => {
		loadQuestions();
	}, []);

	const loadQuestions = async () => {
		try {
			const data = await getChatbotQuestions();
			setQuestions(data?.data || []);
		} catch (_) {}
	};

	const clearAll = () => {
		setSelFee([]);
		setSelBoards([]);
		setSelTypes([]);
		setSelGender('');
		setSelTransport('');
		setOnlyArea(false);
		setOnlyCity(false);
		setSelRanks([]);
		setMessages([]);
	};

	const buildFilters = () => {
		const filters = {};
		// Send ONE value per field to match backend schema (strings)
		if (selFee.length) filters.feeRange = selFee[0];
		if (selBoards.length) filters.board = selBoards[0];
		if (selTypes.length) filters.schoolMode = selTypes[0]; // backend expects 'schoolMode'
		if (selGender) filters.genderType = selGender;
		if (selTransport) filters.transportAvailable = selTransport; // send 'yes' | 'no'
		if (selRanks.length) filters.rank = selRanks[0];
		// Do NOT send areaOnly/cityOnly; not supported by backend filters
		return filters;
	};

	// Fetch automatically when chips change (no UI results)
	useEffect(() => {
		const hasAnySelection = selFee.length || selBoards.length || selTypes.length || selGender || selTransport || selRanks.length;
		if (!hasAnySelection) return;
		let cancelled = false;
		(async () => {
			setLoading(true);
			try {
				await chatbotFilter(buildFilters(), { useAI: false });
				if (!cancelled) {
					setToast('Fetched');
					setTimeout(() => setToast(''), 1200);
				}
			} catch (err) {
				const serverMsg = err?.response?.data?.message || 'Fetch failed';
				if (!cancelled) {
					setToast(serverMsg);
					setTimeout(() => setToast(''), 1600);
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => { cancelled = true; };
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selFee, selBoards, selTypes, selGender, selTransport, selRanks]);



	const handleSend = async () => {
		const text = input.trim();
		setMessages(prev => (text ? [...prev, { role: 'user', text }] : prev));
		setInput('');
		setLoading(true);
		try {
			const payload = { ...buildFilters() };
			if (text) payload.query = text;
			const resp = await chatbotFilter(payload, { useAI: true });
			const names = Array.isArray(resp?.recommendedSchools) ? resp.recommendedSchools : [];
			setResults(names);
			setMessages(prev => [...prev, { role: 'assistant', text: 'Your selection and question were sent.' }]);
		} catch (err) {
			const serverMsg = err?.response?.data?.message || err?.message || 'Sorry, sending failed. Please try again.';
			setMessages(prev => [...prev, { role: 'assistant', text: serverMsg }]);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
		<div className="min-h-screen bg-gray-50">
			<div className="container mx-auto px-4 py-8">
				<div className="mb-6 flex items-center gap-3">
					<MessageSquare className="text-blue-600" />
					<h1 className="text-3xl font-bold text-gray-900">Chatbot</h1>
					<button onClick={clearAll} className="ml-auto text-indigo-600 hover:underline text-sm">Clear all</button>
				</div>

				<div className="grid grid-cols-1 gap-8">
					<div className="bg-white rounded-lg shadow p-6 flex flex-col">
						<h2 className="text-lg font-semibold text-gray-800">Ask about schools</h2>
						<p className="text-gray-600 mb-4">Pick chips in the sections below. We'll fetch matching schools.</p>
						{/* Quick questions removed */}
						<div className="space-y-4 mb-6">
							<div>
								<h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2"><IndianRupee size={18} className="text-gray-800" /> Schools with fee range:</h3>
								<div className="flex flex-wrap gap-3">
									{feeRanges.map(fr => (
										<Chip key={fr} active={selFee.includes(fr)} onClick={() => setSelFee(prev => prev.includes(fr) ? prev.filter(x => x !== fr) : [...prev, fr])}>{fr}</Chip>
									))}
								</div>
							</div>
							<div>
								<h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2"><BookOpen size={18} className="text-gray-800" /> Schools with board:</h3>
								<div className="flex flex-wrap gap-3">
									{boards.map(b => (
										<Chip key={b} active={selBoards.includes(b)} onClick={() => setSelBoards(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b])}>{b}</Chip>
									))}
								</div>
							</div>
							<div>
								<h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2"><Filter size={18} className="text-gray-800" /> Schools with type:</h3>
								<div className="flex flex-wrap gap-3">
									{types.map(t => (
										<Chip key={t} active={selTypes.includes(t)} onClick={() => setSelTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}>{t}</Chip>
									))}
								</div>
							</div>
							<div>
								<h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2"><Users size={18} className="text-gray-800" /> Schools with gender:</h3>
								<div className="flex flex-wrap gap-3">
									{genders.map(g => (
										<Chip key={g} active={selGender === g} onClick={() => setSelGender(prev => prev === g ? '' : g)}>{g}</Chip>
									))}
								</div>
							</div>
							<div>
								<h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2"><Bus size={18} className="text-gray-800" /> Schools with transport:</h3>
								<div className="flex flex-wrap gap-3">
									{transportOptions.map(t => (
										<Chip key={t} active={selTransport === t} onClick={() => setSelTransport(prev => prev === t ? '' : t)}>{t}</Chip>
									))}
								</div>
							</div>
							<div>
								<h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2"><Building2 size={18} className="text-gray-800" /> Schools in my area only</h3>
								<div className="flex flex-wrap gap-3">
									<Chip active={onlyArea} onClick={() => setOnlyArea(v => !v)}>{onlyArea ? 'Yes' : 'No'}</Chip>
								</div>
							</div>
							<div>
								<h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2"><Building2 size={18} className="text-gray-800" /> Schools in my city only</h3>
								<div className="flex flex-wrap gap-3">
									<Chip active={onlyCity} onClick={() => setOnlyCity(v => !v)}>{onlyCity ? 'yes' : 'no'}</Chip>
								</div>
							</div>
							<div>
								<h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2"><Trophy size={18} className="text-gray-800" /> Schools with rank:</h3>
								<div className="flex flex-wrap gap-3">
									{ranks.map(r => (
										<Chip key={r} active={selRanks.includes(r)} onClick={() => setSelRanks(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])}>{r}</Chip>
									))}
								</div>
							</div>
						</div>

						<div className="flex-1 overflow-y-auto space-y-3 mb-4">
							{messages.map((m, i) => (
								<div key={i} className={`${m.role === 'user' ? 'text-right' : 'text-left'}`}>
									<span className={`inline-block px-3 py-2 rounded-lg ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>{m.text}</span>
								</div>
							))}
							{loading && <div className="text-gray-500 text-sm">Thinking…</div>}
						</div>
						<div className="flex gap-2">
						<input ref={setInputEl} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSend(); } }} placeholder="Type your question..." className="flex-1 border rounded px-3 py-2" />
							<button onClick={handleSend} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Send size={16} /> Send</button>
						</div>
					</div>

					{/* Results */}
					{Array.isArray(results) && results.length > 0 && (
						<div className="mt-4">
							<h3 className="text-md font-semibold text-gray-800 mb-2">Matching schools</h3>
							<ul className="list-disc pl-5 text-gray-800">
								{results.map((name, idx) => (
									<li key={idx}>{name}</li>
								))}
							</ul>
						</div>
					)}

					{/* Results removed as requested */}
				</div>
			</div>
		</div>
		{toast && (
			<div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-3 py-1.5 rounded shadow">
				{toast}
			</div>
		)}
		</>
	);
};

export default ChatbotPage;



