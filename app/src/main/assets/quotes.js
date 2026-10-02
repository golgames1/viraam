/* Interlude: the line library and the rules for choosing what appears.
   Shared by settings.html (samples) and overlay.html (the real thing).
   Every line is public domain; English renderings of other languages are our own. */

var LOOK_IDS = ['ink','breath','frost','ripple','candle','drift','stars'];
var LOOK_NAMES = {ink:'Ink',breath:'Breath',frost:'Frost',ripple:'Ripple',candle:'Candle',drift:'Drift',stars:'Stars'};
var GENRES = ['Poetry','Bhakti & Sufi','Stoic','Zen & Tao','Scripture','Nature','Reflection','Wit'];
var LANGS = [
  {id:'en', n:'English',  s:'English'},
  {id:'hi', n:'Hindi',    s:'हिन्दी'},
  {id:'sa', n:'Sanskrit', s:'संस्कृत'},
  {id:'bn', n:'Bengali',  s:'বাংলা'},
  {id:'pa', n:'Punjabi',  s:'ਪੰਜਾਬੀ'},
  {id:'ta', n:'Tamil',    s:'தமிழ்'}
];
var SCRIPT_FONT = {
  hi:'"Tiro Devanagari Hindi","Noto Sans Devanagari",serif',
  sa:'"Tiro Devanagari Sanskrit","Tiro Devanagari Hindi","Noto Sans Devanagari",serif',
  bn:'"Tiro Bangla","Noto Sans Bengali",serif',
  pa:'"Tiro Gurmukhi","Noto Sans Gurmukhi",serif',
  ta:'"Tiro Tamil","Noto Sans Tamil",serif'
};

/* id, language, kinds, text, English meaning, author, optional seal text, optional look it suits */
var LIB = [
  /* ---------------- Hindi: dohas and bhakti ---------------- */
  {id:'kabir-dheere', l:'hi', g:['Bhakti & Sufi','Poetry'], s:'कबीर', look:'ink',
   t:'धीरे धीरे रे मना, धीरे सब कुछ होय। माली सींचे सौ घड़ा, ऋतु आए फल होय॥',
   tr:'Slowly, slowly, O mind: all things come in their own time. The gardener may pour a hundred pots, but fruit comes with its season.', a:'Kabir'},
  {id:'kabir-pothi', l:'hi', g:['Bhakti & Sufi','Poetry'], s:'कबीर',
   t:'पोथी पढ़ि पढ़ि जग मुआ, पंडित भया न कोय। ढाई आखर प्रेम का, पढ़े सो पंडित होय॥',
   tr:'The world wore itself out reading books, and no one grew wise. Whoever reads the two and a half letters of love is wise.', a:'Kabir'},
  {id:'kabir-bura', l:'hi', g:['Bhakti & Sufi','Reflection'], s:'कबीर',
   t:'बुरा जो देखन मैं चला, बुरा न मिलिया कोय। जो दिल खोजा आपना, मुझसा बुरा न कोय॥',
   tr:'I went out looking for the bad and found no one. When I searched my own heart, I found no one worse than me.', a:'Kabir'},
  {id:'kabir-aaj', l:'hi', g:['Bhakti & Sufi','Reflection'], s:'कबीर',
   t:'काल करे सो आज कर, आज करे सो अब। पल में परलय होएगी, बहुरि करेगा कब॥',
   tr:'Do tomorrow’s work today, and today’s work now.', a:'Kabir'},
  {id:'kabir-bani', l:'hi', g:['Bhakti & Sufi','Reflection'], s:'कबीर',
   t:'ऐसी वाणी बोलिए, मन का आपा खोय। औरन को शीतल करे, आपहु शीतल होय॥',
   tr:'Speak in a way that sets your own pride aside: it cools the listener, and cools you too.', a:'Kabir'},
  {id:'kabir-deepak', l:'hi', g:['Bhakti & Sufi'], s:'कबीर', look:'candle',
   t:'जब मैं था तब हरि नहीं, अब हरि हैं मैं नाहिं। सब अँधियारा मिट गया, जब दीपक देख्या माहिं॥',
   tr:'While I was, the divine was not. Now it is, and I am not. All darkness went when I saw the lamp within.', a:'Kabir'},
  {id:'kabir-sain', l:'hi', g:['Bhakti & Sufi'], s:'कबीर',
   t:'साईं इतना दीजिए, जा में कुटुम समाय। मैं भी भूखा न रहूँ, साधु न भूखा जाय॥',
   tr:'Give me only this much, Lord: enough for my household, so that I am not hungry, and no guest leaves hungry either.', a:'Kabir'},
  {id:'rahim-dhaga', l:'hi', g:['Poetry'], s:'रहीम',
   t:'रहिमन धागा प्रेम का, मत तोड़ो चटकाय। टूटे से फिर ना मिले, मिले गाँठ परि जाय॥',
   tr:'Says Rahim: do not snap the thread of love. Once broken it will not rejoin, and if it does, a knot remains.', a:'Rahim'},
  {id:'rahim-paani', l:'hi', g:['Poetry','Reflection'], s:'रहीम',
   t:'रहिमन पानी राखिये, बिन पानी सब सून। पानी गए न ऊबरे, मोती मानुष चून॥',
   tr:'Keep your water, says Rahim; without it all is empty. Pearl, person and lime are all lost once their water goes.', a:'Rahim'},
  {id:'rahim-bade', l:'hi', g:['Poetry','Reflection'], s:'रहीम',
   t:'बड़े बड़ाई ना करें, बड़े न बोलें बोल। रहिमन हीरा कब कहे, लाख टका मेरो मोल॥',
   tr:'The great do not praise themselves. When did a diamond ever announce its own price?', a:'Rahim'},
  {id:'vrind-abhyas', l:'hi', g:['Reflection'], s:'वृंद',
   t:'करत करत अभ्यास के जड़मति होत सुजान। रसरी आवत जात ते सिल पर परत निसान॥',
   tr:'With practice even a dull mind grows wise, as a rope passing over stone wears a groove in it.', a:'Vrind'},
  {id:'tulsidas-daya', l:'hi', g:['Bhakti & Sufi','Scripture'], s:'तुलसी',
   t:'दया धर्म का मूल है, पाप मूल अभिमान।',
   tr:'Kindness is the root of the good life; pride is the root of harm.', a:'Tulsidas'},
  {id:'mira-giridhar', l:'hi', g:['Bhakti & Sufi','Poetry'], s:'मीरा',
   t:'मेरे तो गिरधर गोपाल, दूसरो न कोई।',
   tr:'Mine is Giridhar Gopal, and no one else.', a:'Mirabai'},

  /* ---------------- Urdu ---------------- */
  {id:'ghalib-hazaron', l:'hi', g:['Poetry'], s:'ग़ालिब',
   t:'हज़ारों ख़्वाहिशें ऐसी कि हर ख़्वाहिश पे दम निकले, बहुत निकले मेरे अरमान लेकिन फिर भी कम निकले',
   tr:'A thousand longings, each one worth a life. So many came true, and still they were too few.', a:'Ghalib'},
  {id:'ghalib-nadan', l:'hi', g:['Poetry','Reflection'], s:'ग़ालिब', look:'candle',
   t:'दिल-ए-नादाँ तुझे हुआ क्या है, आख़िर इस दर्द की दवा क्या है',
   tr:'Foolish heart, what has come over you? What, after all, is the cure for this ache?', a:'Ghalib'},
  {id:'ghalib-qaid', l:'hi', g:['Poetry','Reflection'], s:'ग़ालिब',
   t:'क़ैद-ए-हयात ओ बंद-ए-ग़म, अस्ल में दोनों एक हैं',
   tr:'The prison of living and the chain of sorrow are, in truth, one and the same.', a:'Ghalib'},
  {id:'iqbal-sitaron', l:'hi', g:['Poetry'], s:'इक़बाल', look:'stars',
   t:'सितारों से आगे जहाँ और भी हैं',
   tr:'Beyond the stars there are other worlds still.', a:'Iqbal'},
  {id:'iqbal-khudi', l:'hi', g:['Poetry','Reflection'], s:'इक़बाल',
   t:'ख़ुदी को कर बुलंद इतना कि हर तक़दीर से पहले, ख़ुदा बंदे से ख़ुद पूछे बता तेरी रज़ा क्या है',
   tr:'Raise your self so high that, before each turn of fate, God himself asks you what you would have.', a:'Iqbal'},
  {id:'momin-paas', l:'hi', g:['Poetry'], s:'मोमिन',
   t:'तुम मेरे पास होते हो गोया, जब कोई दूसरा नहीं होता',
   tr:'You are somehow near me whenever no one else is.', a:'Momin'},

  /* ---------------- Sanskrit ---------------- */
  {id:'gita-2-47', l:'sa', g:['Scripture'], s:'गीता',
   t:'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।',
   tr:'Your right is to the work alone, never to its fruits.', a:'Bhagavad Gita 2.47'},
  {id:'gita-2-48', l:'sa', g:['Scripture','Reflection'], s:'गीता',
   t:'योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय।',
   tr:'Steady within, do your work, and let go of clinging.', a:'Bhagavad Gita 2.48'},
  {id:'gita-6-5', l:'sa', g:['Scripture','Reflection'], s:'गीता',
   t:'उद्धरेदात्मनात्मानं नात्मानमवसादयेत्।',
   tr:'Lift yourself by yourself; do not let yourself sink.', a:'Bhagavad Gita 6.5'},
  {id:'upanishad-asato', l:'sa', g:['Scripture','Reflection'], s:'उपनिषद्', look:'candle',
   t:'असतो मा सद्गमय। तमसो मा ज्योतिर्गमय।',
   tr:'Lead me from the unreal to the real, from darkness to light.', a:'Brihadaranyaka Upanishad'},
  {id:'upanishad-purnam', l:'sa', g:['Scripture'], s:'उपनिषद्',
   t:'पूर्णमदः पूर्णमिदं पूर्णात् पूर्णमुदच्यते।',
   tr:'That is whole; this is whole. From the whole, the whole arises.', a:'Isha Upanishad'},
  {id:'patanjali-yoga', l:'sa', g:['Scripture','Zen & Tao'], s:'योग',
   t:'योगश्चित्तवृत्तिनिरोधः।',
   tr:'Yoga is the settling of the mind’s restless turning.', a:'Patanjali, Yoga Sutra 1.2'},
  {id:'subhashita-udyam', l:'sa', g:['Reflection'], s:'सुभाषित',
   t:'उद्यमेन हि सिध्यन्ति कार्याणि न मनोरथैः।',
   tr:'Things are accomplished by effort, not by wishing for them.', a:'Subhashita'},
  {id:'subhashita-vidya', l:'sa', g:['Reflection'], s:'सुभाषित',
   t:'विद्या ददाति विनयं विनयाद् याति पात्रताम्।',
   tr:'Learning gives humility; from humility comes worth.', a:'Subhashita'},

  /* ---------------- Bengali ---------------- */
  {id:'tagore-ekla', l:'bn', g:['Poetry'], s:'রবীন্দ্র',
   t:'যদি তোর ডাক শুনে কেউ না আসে তবে একলা চলো রে',
   tr:'If no one answers your call, walk on alone.', a:'Tagore'},
  {id:'tagore-chitto', l:'bn', g:['Poetry','Reflection'], s:'রবীন্দ্র',
   t:'চিত্ত যেথা ভয়শূন্য, উচ্চ যেথা শির',
   tr:'Where the mind is without fear and the head is held high.', a:'Tagore'},
  {id:'lalon-pakhi', l:'bn', g:['Bhakti & Sufi','Poetry'], s:'লালন',
   t:'খাঁচার ভিতর অচিন পাখি কেমনে আসে যায়',
   tr:'How does the unknown bird come and go through the cage?', a:'Lalon'},

  /* ---------------- Punjabi ---------------- */
  {id:'bulleh-kaun', l:'pa', g:['Bhakti & Sufi'], s:'ਬੁੱਲ੍ਹਾ',
   t:'ਬੁੱਲ੍ਹਿਆ ਕੀ ਜਾਣਾ ਮੈਂ ਕੌਣ',
   tr:'Bulleh, who knows who I am?', a:'Bulleh Shah'},
  {id:'bulleh-ilmon', l:'pa', g:['Bhakti & Sufi','Reflection'], s:'ਬੁੱਲ੍ਹਾ',
   t:'ਇਲਮੋਂ ਬਸ ਕਰੀਂ ਓ ਯਾਰ',
   tr:'Enough of learning now, my friend.', a:'Bulleh Shah'},
  {id:'nanak-chardi', l:'pa', g:['Bhakti & Sufi','Scripture'], s:'ਨਾਨਕ',
   t:'ਨਾਨਕ ਨਾਮ ਚੜ੍ਹਦੀ ਕਲਾ, ਤੇਰੇ ਭਾਣੇ ਸਰਬੱਤ ਦਾ ਭਲਾ',
   tr:'In your name, Nanak, may our spirits rise, and may all people prosper.', a:'Sikh ardas'},

  /* ---------------- Tamil ---------------- */
  {id:'kural-391', l:'ta', g:['Reflection','Scripture'], s:'வள்ளுவர்',
   t:'கற்க கசடறக் கற்பவை கற்றபின் நிற்க அதற்குத் தக',
   tr:'Learn fully what is worth learning, then live by it.', a:'Thirukkural 391'},
  {id:'kural-396', l:'ta', g:['Reflection','Scripture'], s:'வள்ளுவர்',
   t:'தொட்டனைத் தூறும் மணற்கேணி மாந்தர்க்குக் கற்றனைத் தூறும் அறிவு',
   tr:'As a well in sand yields water the deeper you dig, so learning yields wisdom.', a:'Thirukkural 396'},
  {id:'avvai-katrathu', l:'ta', g:['Reflection'], s:'ஔவை',
   t:'கற்றது கைமண் அளவு, கல்லாதது உலகளவு',
   tr:'What is learned is a handful of sand; what is unlearned is the size of the world.', a:'Avvaiyar'},
  {id:'bharathi-enniya', l:'ta', g:['Poetry','Reflection'], s:'பாரதி',
   t:'எண்ணிய முடிதல் வேண்டும், நல்லவே எண்ணல் வேண்டும்',
   tr:'What you intend should come to pass, and may you intend only good.', a:'Bharathiyar'},

  /* ---------------- Stoic ---------------- */
  {id:'marcus-little', l:'en', g:['Stoic'], look:'candle', t:'Very little is needed to make a happy life.', a:'Marcus Aurelius'},
  {id:'marcus-change', l:'en', g:['Stoic','Nature'], t:'Loss is nothing else but change, and change is nature’s delight.', a:'Marcus Aurelius'},
  {id:'marcus-present', l:'en', g:['Stoic','Reflection'], t:'Confine yourself to the present.', a:'Marcus Aurelius'},
  {id:'marcus-way', l:'en', g:['Stoic'], t:'What blocks the way becomes the way.', a:'Marcus Aurelius'},
  {id:'marcus-quiet', l:'en', g:['Stoic','Reflection'], look:'frost', t:'Nowhere can a person find a quieter retreat than in their own mind.', a:'Marcus Aurelius'},
  {id:'seneca-time', l:'en', g:['Stoic'], t:'Nothing is ours except time.', a:'Seneca'},
  {id:'seneca-imagination', l:'en', g:['Stoic','Reflection'], t:'We suffer more often in imagination than in reality.', a:'Seneca'},
  {id:'seneca-waste', l:'en', g:['Stoic','Reflection'], t:'It is not that we have a short time to live, but that we waste much of it.', a:'Seneca'},
  {id:'seneca-everywhere', l:'en', g:['Stoic','Reflection'], t:'The one who is everywhere is nowhere.', a:'Seneca'},
  {id:'epictetus-master', l:'en', g:['Stoic'], t:'No one is free who is not master of himself.', a:'Epictetus'},
  {id:'epictetus-opinions', l:'en', g:['Stoic','Reflection'], t:'It is not things that disturb us, but our opinions about things.', a:'Epictetus'},
  {id:'epictetus-wish', l:'en', g:['Stoic'], t:'Do not wish for things to happen as you want; wish them to happen as they do.', a:'Epictetus'},
  {id:'epicurus-enough', l:'en', g:['Stoic','Reflection'], t:'Nothing is enough for the person to whom enough is too little.', a:'Epicurus'},

  /* ---------------- Zen & Tao ---------------- */
  {id:'laotzu-hurry', l:'en', g:['Zen & Tao','Nature'], look:'breath', t:'Nature does not hurry, yet everything is accomplished.', a:'Lao Tzu'},
  {id:'laotzu-muddy', l:'en', g:['Zen & Tao','Nature'], look:'ripple', t:'Muddy water, let stand, becomes clear.', a:'Lao Tzu'},
  {id:'laotzu-journey', l:'en', g:['Zen & Tao'], t:'A journey of a thousand miles begins beneath one’s feet.', a:'Lao Tzu'},
  {id:'laotzu-knowing', l:'en', g:['Zen & Tao','Reflection'], t:'Knowing others is wisdom; knowing yourself is clarity.', a:'Lao Tzu'},
  {id:'laotzu-bow', l:'en', g:['Zen & Tao'], t:'Stretch a bow to the very full, and you will wish you had stopped in time.', a:'Lao Tzu'},
  {id:'zhuangzi-butterfly', l:'en', g:['Zen & Tao','Poetry'], look:'drift', t:'I dreamt I was a butterfly, and woke not knowing whether I am a man who dreamt of a butterfly, or a butterfly dreaming of a man.', a:'Zhuangzi'},
  {id:'zhuangzi-mirror', l:'en', g:['Zen & Tao'], look:'ripple', t:'The still mind of the sage is a mirror of heaven and earth.', a:'Zhuangzi'},
  {id:'zen-wood', l:'en', g:['Zen & Tao'], t:'Before enlightenment, chop wood, carry water. After enlightenment, chop wood, carry water.', a:'Zen saying'},
  {id:'zen-cup', l:'en', g:['Zen & Tao','Reflection'], t:'A cup that is already full cannot be filled.', a:'Zen saying'},
  {id:'basho-pond', l:'en', g:['Zen & Tao','Poetry','Nature'], look:'ripple', t:'Old pond — a frog leaps in, the sound of water.', a:'Bashō'},
  {id:'basho-travellers', l:'en', g:['Zen & Tao','Reflection'], t:'The days and months are travellers of eternity, and so are the years that pass.', a:'Bashō'},
  {id:'issa-snail', l:'en', g:['Zen & Tao','Poetry','Nature'], look:'drift', t:'Little snail, climb Mount Fuji — but slowly, slowly.', a:'Issa'},
  {id:'ryokan-moon', l:'en', g:['Zen & Tao','Poetry'], look:'stars', t:'The thief left it behind — the moon at my window.', a:'Ryōkan'},
  {id:'dhammapada-thought', l:'en', g:['Scripture','Reflection'], t:'All that we are is the result of what we have thought.', a:'Dhammapada'},
  {id:'dhammapada-hatred', l:'en', g:['Scripture','Reflection'], t:'Hatred is never ended by hatred, but by love.', a:'Dhammapada'},
  {id:'confucius-slow', l:'en', g:['Reflection'], t:'It does not matter how slowly you go, so long as you do not stop.', a:'Confucius'},

  /* ---------------- Nature ---------------- */
  {id:'thoreau-stream', l:'en', g:['Nature','Reflection'], look:'ripple', t:'Time is but the stream I go a-fishing in.', a:'Thoreau'},
  {id:'thoreau-simplify', l:'en', g:['Reflection'], look:'frost', t:'Our life is frittered away by detail. Simplify, simplify.', a:'Thoreau'},
  {id:'thoreau-drummer', l:'en', g:['Reflection','Nature'], t:'If a man does not keep pace with his companions, perhaps he hears a different drummer.', a:'Thoreau'},
  {id:'thoreau-eternity', l:'en', g:['Reflection'], t:'You cannot kill time without injuring eternity.', a:'Thoreau'},
  {id:'emerson-pace', l:'en', g:['Nature'], look:'drift', t:'Adopt the pace of nature: her secret is patience.', a:'Emerson'},
  {id:'emerson-peace', l:'en', g:['Reflection'], t:'Nothing can bring you peace but yourself.', a:'Emerson'},
  {id:'muir-mountains', l:'en', g:['Nature'], t:'The mountains are calling and I must go.', a:'John Muir'},
  {id:'wordsworth-world', l:'en', g:['Poetry','Reflection'], look:'frost', t:'The world is too much with us; getting and spending, we lay waste our powers.', a:'Wordsworth'},
  {id:'blake-grain', l:'en', g:['Poetry','Nature'], look:'stars', t:'To see a world in a grain of sand, and a heaven in a wild flower.', a:'Blake'},
  {id:'heraclitus-river', l:'en', g:['Reflection','Nature'], look:'ripple', t:'No one ever steps in the same river twice.', a:'Heraclitus'},
  {id:'tagore-butterfly', l:'en', g:['Nature','Poetry'], look:'drift', t:'The butterfly counts not months but moments, and has time enough.', a:'Tagore'},
  {id:'tagore-stars', l:'en', g:['Poetry'], look:'stars', t:'If you shed tears when you miss the sun, you also miss the stars.', a:'Tagore'},
  {id:'tagore-sleep', l:'en', g:['Poetry','Reflection'], t:'I slept and dreamt that life was joy. I awoke and saw that life was service.', a:'Tagore'},

  /* ---------------- Poetry & reflection ---------------- */
  {id:'dickinson-nows', l:'en', g:['Poetry'], t:'Forever is composed of nows.', a:'Emily Dickinson'},
  {id:'dickinson-hope', l:'en', g:['Poetry'], look:'drift', t:'Hope is the thing with feathers that perches in the soul.', a:'Emily Dickinson'},
  {id:'whitman-enough', l:'en', g:['Poetry','Reflection'], t:'I exist as I am, that is enough.', a:'Walt Whitman'},
  {id:'whitman-loafe', l:'en', g:['Poetry','Nature'], look:'drift', t:'I loafe and invite my soul.', a:'Walt Whitman'},
  {id:'keats-beauty', l:'en', g:['Poetry'], t:'A thing of beauty is a joy for ever.', a:'Keats'},
  {id:'pascal-room', l:'en', g:['Reflection'], look:'frost', t:'All our unhappiness comes from one thing: not knowing how to stay quietly in a room.', a:'Pascal'},
  {id:'socrates-examined', l:'en', g:['Reflection'], t:'The unexamined life is not worth living.', a:'Socrates'},
  {id:'vangogh-stars', l:'en', g:['Reflection'], look:'stars', t:'I know nothing with any certainty, but the sight of the stars makes me dream.', a:'Van Gogh'},
  {id:'gibran-work', l:'en', g:['Reflection'], t:'Work is love made visible.', a:'Kahlil Gibran'},
  {id:'gibran-together', l:'en', g:['Reflection','Poetry'], t:'Let there be spaces in your togetherness.', a:'Kahlil Gibran'},
  {id:'tolstoy-change', l:'en', g:['Reflection'], t:'Everyone thinks of changing the world, but no one thinks of changing himself.', a:'Tolstoy'},
  {id:'goethe-day', l:'en', g:['Reflection'], t:'Nothing is worth more than this day.', a:'Goethe'},
  {id:'kierkegaard-backwards', l:'en', g:['Reflection'], t:'Life can only be understood backwards, but it must be lived forwards.', a:'Kierkegaard'},
  {id:'eliot-still', l:'en', g:['Reflection','Zen & Tao'], look:'breath', t:'Teach us to sit still.', a:'T. S. Eliot'},

  /* ---------------- Wit ---------------- */
  {id:'wilde-temptation', l:'en', g:['Wit'], t:'I can resist everything except temptation.', a:'Oscar Wilde'},
  {id:'wilde-ordinary', l:'en', g:['Wit'], t:'I have the simplest tastes. I am always satisfied with the best.', a:'Oscar Wilde'},
  {id:'jerome-work', l:'en', g:['Wit'], t:'I like work; it fascinates me. I can sit and look at it for hours.', a:'Jerome K. Jerome'},
  {id:'twain-reading', l:'en', g:['Wit','Reflection'], t:'The man who does not read has no advantage over the man who cannot read.', a:'Mark Twain'},
  {id:'twain-mind', l:'en', g:['Wit','Reflection'], t:'Whenever you find yourself on the side of the majority, it is time to pause and reflect.', a:'Mark Twain'},
  {id:'chesterton-angels', l:'en', g:['Wit','Reflection'], look:'drift', t:'Angels can fly because they take themselves lightly.', a:'G. K. Chesterton'},
  {id:'parkinson-work', l:'en', g:['Wit','Reflection'], t:'Work expands to fill the time available for its completion.', a:'C. Northcote Parkinson'}
];

function detectLang(t){
  if(/[؀-ۿ]/.test(t)) return 'ur';
  if(/[ঀ-৿]/.test(t)) return 'bn';
  if(/[਀-੿]/.test(t)) return 'pa';
  if(/[஀-௿]/.test(t)) return 'ta';
  if(/[ऀ-ॿ]/.test(t)) return 'hi';
  return 'en';
}
function hashStr(s){ var h=0; for(var i=0;i<s.length;i++){ h=(h*31+s.charCodeAt(i))|0; } return (h>>>0).toString(36); }
function weighted(items, wf){
  var tot=0, ws=items.map(function(x){ var w=Math.max(0,wf(x)); tot+=w; return w; });
  if(!tot) return items[Math.floor(Math.random()*items.length)];
  var r=Math.random()*tot;
  for(var i=0;i<items.length;i++){ r-=ws[i]; if(r<=0) return items[i]; }
  return items[items.length-1];
}

/* lines in the chosen kinds and languages */
function libraryPool(P){
  var w=P.w||{}, gs=P.genres||{};
  return LIB.filter(function(q){ return w[q.l]>0 && q.g.some(function(g){ return gs[g]; }); });
}
function myLines(P){
  return (P.mine||[]).map(function(m){
    return {id:'mine-'+hashStr(m.t), l:detectLang(m.t), g:['Your own'], t:m.t, a:m.a||'', look:(m.look&&m.look!=='any')?m.look:null, mine:true};
  });
}

/* lines you kept with a long press come back more often */
function keptTexts(P){
  var m={}; (P.kept||[]).forEach(function(k){ if(k && k.t) m[k.t]=1; }); return m;
}
function pickQuote(P, H){
  var recent=(H&&H.recent)||[], mine=myLines(P), kept=keptTexts(P);
  var share={sometimes:.15, often:.4, only:1}[P.freq||'sometimes'];
  var pool = (mine.length && Math.random()<share) ? mine : libraryPool(P);
  if(!pool.length) pool = mine.length ? mine : LIB.filter(function(q){ return q.l==='en'; });
  // don't repeat recent lines, but with a small pool only remember a few
  var remember=Math.max(3, Math.min(25, Math.round(pool.length*.6)));
  var skip=recent.slice(-remember);
  var fresh=pool.filter(function(q){ return skip.indexOf(q.id)<0; });
  if(fresh.length) pool=fresh;
  return weighted(pool, function(q){
    var w = q.mine ? 1 : ((P.w||{})[q.l]||1);
    if(kept[q.t]) w*=2.5;                 // you kept this one before
    return w;
  });
}

function pickLook(P, q, H, hour, force){
  if(force) return force;
  var on=LOOK_IDS.filter(function(id){ return (P.on||{})[id]; });
  if(!on.length) on=LOOK_IDS.slice();
  if(P.mode==='one') return on[0];
  if(q.look && on.indexOf(q.look)>=0 && (q.mine || Math.random()<.5)) return q.look;
  var pool=on.slice();
  var last=H&&H.lastLook;
  if(pool.length>1) pool=pool.filter(function(id){ return id!==last; });
  var night = hour>=19 || hour<6;
  var offTime={}; (night?['drift','ripple']:['candle','stars']).forEach(function(id){ offTime[id]=1; });
  return weighted(pool, function(id){
    var w=(P.fav||{})[id]?2:1;
    if(id==='ink' && q.l!=='en') w*=3;       // verse in its own script suits the brush
    // time of day leans the choice rather than ruling looks out, so every look still turns up
    if(P.timeOfDay && offTime[id]) w*=.25;
    return w;
  });
}
