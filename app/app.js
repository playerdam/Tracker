(function(){
  "use strict";
  const STORE_KEY="mise_state_v2";
  const API_BASE="";
  function apiBase(){if(API_BASE)return API_BASE.replace(/\/$/,"");if(location.protocol==="http:"||location.protocol==="https:")return location.origin;return "";}
  const hasStore=false;
  const $=s=>document.querySelector(s);

  // ── Crash-telemetri: vi vil VIDE det når appen fejler hos brugerne ──
  let _errSent=0;
  function _reportError(msg,src,line,stack){
    if(_errSent>=5)return;_errSent++;
    try{
      fetch(apiBase()+"/api/client-error",{method:"POST",keepalive:true,headers:{"Content-Type":"application/json"},body:JSON.stringify({
        msg:String(msg||"").slice(0,300),src:String(src||"").slice(0,200),line:line||0,
        stack:String(stack||"").slice(0,500),ua:(navigator.userAgent||"").slice(0,120)
      })}).catch(()=>{});
    }catch(e){}
  }
  window.addEventListener("error",e=>_reportError(e.message,e.filename,e.lineno,e.error&&e.error.stack));
  window.addEventListener("unhandledrejection",e=>_reportError("unhandledrejection: "+((e.reason&&e.reason.message)||e.reason),"",0,e.reason&&e.reason.stack));

  // ── Dynamic Type: respektér iOS' tekststørrelse (skalér forsigtigt) ──
  (function(){
    try{
      const probe=document.createElement("div");
      probe.style.cssText="font:-apple-system-body;position:absolute;visibility:hidden";
      probe.textContent="x";
      document.documentElement.appendChild(probe);
      const sz=parseFloat(getComputedStyle(probe).fontSize)||17;
      probe.remove();
      const scale=Math.min(sz/17,1.3);
      if(scale>1.03)document.body.style.zoom=scale;
    }catch(e){}
  })();

  // ---- i18n ----
  const LANGS={
    da:{
      tagline:"track your career",total_label:"karriere",
      tab_station:"Stationen",tab_wine:"Vin",tab_vagt:"Overblik",tab_lab:"Lab",
      view_grid:"Gitteroversigt",view_list:"Listevisning",
      qlog_ph:"Skriv hvad du har lavet — fx åbnet 500 Gillardeau østers",
      loading:"Indlæser…",
      add_counter:"+ Ny tæller",add_sub:"+ underkategori",sub_ph:"Skriv en type…",
      add_wine:"+ Tilføj vin manuelt",wine_search_ph:"Søg i dine vine…",
      wine_db_head:"Fra vindatabasen",wine_searching:"Søger i databasen…",
      wine_no_match:"Ingen match i databasen",wine_no_backend:"Tilknyt backend for at søge",
      wine_fail:"Kunne ikke søge — prøv igen",
      wine_none:"Ingen vine endnu — søg foroven for at tilføje.",
      wine_no_q:"Ingen vine matcher søgningen.",
      wine_add:"Tilføj",glasses:"Glas",bottles:"Flasker",add_vintage:"+ årgang",
      w_type:"Type",wine_alle:"Alle",
      wine_type_rod:"Rød",wine_type_hvid:"Hvid",wine_type_rose:"Rosé",wine_type_mousserende:"Mousserende",wine_type_andet:"Andet",
      wine_no_country:"Uden land",
      counter_new:"Ny tæller",counter_edit:"Rediger tæller",
      counter_q:"Hvad tæller du?",counter_ph:"fx Østers åbnet",
      wine_new:"Tilføj vin",wine_edit:"Rediger vin",wine_scan:"Scan etiket",wine_scan_loading:"Aflæser etiket…",wine_scan_err:"Kunne ikke aflæse etiketten — prøv igen",wine_add_manual:"+ Tilføj manuelt",
      wine_lineup:"Scan lineup",wine_lineup_loading:"Analyserer lineup…",wine_lineup_err:"Kunne ikke analysere billedet — prøv igen",
      lineup_title:"Fundet i lineup",lineup_sub_fn:"{0} vine identificeret · {1} kunne ikke læses",lineup_add_all:"Stash dem alle",lineup_unreadable:"Etiket ikke tydelig",
      w_name:"Navn",w_name_ph:"fx Tignanello",
      w_producer:"Producent",w_producer_ph:"fx Antinori",
      w_land:"Land",w_land_ph:"Italien",
      w_region:"Område",w_region_ph:"Toscana",
      w_grape:"Druetype",w_grape_ph:"Sangiovese",w_grape_add:"Tilføj drue",
      w_vint:"Årgang",w_vint_ph:"2019",
      w_about:"Om producenten & vinen",w_about_ph:"Kort om stil, oprindelse eller hvad der gør denne vin speciel…",w_about_btn:"Om vinen",w_about_unknown:"Vi kender ikke denne vin endnu.",
      w_photo:"Billede",wine_add_photo:"Tilføj billede",wine_change_photo:"Skift billede",wine_remove_photo:"Fjern",
      save:"Gem",cancel:"Annullér",del:"Slet",
      ask_title:"Ukendt ting",ask_name_lbl:"Navn",
      ask_as_counter:"Som ny, selvstændig tæller",ask_as_sub:"Som underkategori til:",
      ask_add:"Tilføj",ask_skip:"Spring over",
      undo:"Fortryd",
      numtray_add:"Tilføj til",numtray_set:"Sæt {0} til",
      log_empty:"Ingen indgange endnu — brug quick-log foroven",
      toast_unknown:"Forstod ikke — prøv fx 'snittet 500 rødløg'",
      toast_logged:"Logget: ",toast_nothing:"Intet tilføjet",
      ask_no_match:"matcher ingen eksisterende kategori.",
      wines_count:"{0} vine",summary_glasses:"glas",summary_bottles:"flasker",
      auth_email:"Email",auth_pw:"Adgangskode",
      auth_login:"Log ind",auth_signup:"Opret konto",
      auth_sub_login:"Log ind for at fortsætte",auth_sub_signup:"Lad os oprette din konto",
      auth_no_account:"Ingen konto?",auth_have_account:"Har du allerede en konto?",
      auth_create:"Opret konto",auth_to_login:"Log ind",
      auth_forgot:"Glemt adgangskode?",auth_forgot_sent:"Tjek din email for et nulstillingslink",
      auth_signout:"Log ud",
      auth_splash_tag:"Track dit håndværk.\nFejr dit arbejde.\nVoks hver dag.",
      auth_get_started:"Kom i gang",auth_go_login:"Log ind",
      auth_h1_login:"Velkommen tilbage 👋",auth_h1_signup:"Opret din konto",
      auth_or:"eller",auth_google:"Fortsæt med Google",auth_apple:"Fortsæt med Apple",
      auth_oauth_err:"Kunne ikke logge ind — prøv igen",
      su_title1:"Opret din konto",su_sub1:"Lad os lære dig at kende",
      su_username_lbl:"Brugernavn",su_workplace_lbl:"Hvor arbejder du?",su_workplace_ph:"Restaurantens navn eller sted",su_workplace_hint:"fx The Rooftop, København",
      su_role_lbl:"Rolle",su_continue:"Fortsæt",
      su_title2:"Næsten der!",su_sub2:"Bekræft dine oplysninger",
      su_row_user:"Brugernavn",su_row_work:"Arbejdsplads",su_row_role:"Rolle",su_edit:"Rediger",
      su_save:"Gem og fortsæt",su_back:"Tilbage",su_username_needed:"Vælg et brugernavn først",
      su_role_needed:"Vælg din rolle",
      su_role_chef:"Kok",su_role_chef_sub:"Track køkken-prep",
      su_role_waiter:"Tjener",su_role_waiter_sub:"Track service & borde",
      su_role_bartender:"Bartender",su_role_bartender_sub:"Track drinks & bar",
      su_role_barista:"Barista",su_role_barista_sub:"Track kaffe & drikke",
      tab_social:"Rangliste",
      challenge_title:"Ugens udfordring",challenge_days:"dage tilbage",challenge_ends:"{0} dage tilbage",
      lb_title:"Ugentlig rangliste",lb_week:"uge fra",lb_anon:"Anonym",lb_you:"dig",lb_empty:"Ingen data endnu",
      stab_global:"🌍 Global",stab_challenge:"🏆 Ugens",
      lb_period_week:"Uge",lb_period_month:"Måned",lb_period_all:"Altid",
      lb_total_pts:"pt i alt",team_lb_title:"Dit hold",team_no_team:"Ikke på et hold endnu",
      team_title:"Hold",team_create_ph:"fx Noma Kitchen",team_create_btn:"Opret hold",
      team_join_ph:"XXXXXX",team_join_btn:"Tilslut",team_or:"eller",
      team_create_or_join:"Opret et hold eller tilslut dig ét med en invite-kode.",
      team_not_found:"Hold ikke fundet",team_copy:"Kopier",team_copied:"Kopieret",
      team_this_week:"Denne uge",
      profile_username_lbl:"Brugernavn",profile_nick_lbl:"Kaldenavn",profile_nick_ph:"fx Simon",
      profile_prof_lbl:"Profession",profile_prof_default:"Vælg profession",
      profile_save:"Gem",
      username_checking:"Tjekker…",username_ok:"Ledigt",username_taken:"Optaget",username_invalid:"Kun bogstaver, tal og _ (3-30 tegn)",
      username_setup_title:"Vælg et brugernavn",username_setup_hint:"Dit brugernavn bruges når andre søger efter dig. Du kan altid ændre det senere.",
      username_setup_save:"Gem brugernavn",username_setup_skip:"Springe over",
      follow_req_title:"Følgeanmodninger",follow_req_accept:"Godkend",follow_req_reject:"Afvis",
      feed_requested:"Anmodet",
      new_badge:"Nyt badge",
      professions:["Kok","Tjener","Bartender","Barista","Sommelier","Andet"],
      streak_day:"1 dag i træk",streak_days:"{0} dage i træk",
      offline_pending:"{0} afventende sync",
      tab_feed:"Feed",
      feed_tab_mine:"Mit feed",feed_tab_discover:"Discover",
      feed_empty:"Følg nogen for at se deres aktivitet her",
      feed_empty_own:"Du har ikke postet noget endnu",
      feed_load_more:"Indlæs mere",
      feed_search_ph:"Søg på kaldenavn…",
      lab_sub:"Eksperimenter med dine retter",
      lab_new:"Nyt eksperiment",
      lab_photo_lbl:"Tag et billede",
      lab_photo_sub:"Tryk for at vælge foto",
      lab_analyze:"Analyser med AI",
      lab_cancel:"Annuller",
      lab_save:"Gem eksperiment",
      lab_loading:"AI analyserer retten…",
      lab_delete:"Slet",
      lab_close:"Luk",
      lab_empty_title:"Ingen eksperimenter endnu",
      lab_empty_sub:"Tag et billede af en ret og lad AI løfte den",
      lab_new_dish:"Ny ret",lab_filter_all:"Alle",lab_filter_idea:"Idé",lab_filter_testing:"Test",lab_filter_ready:"Klar",lab_filter_menu:"På menu",
      lab_name_ph:"Navn på retten…",lab_hero_add:"Tilføj forsidebillede",
      lab_status_idea:"Idé",lab_status_testing:"Test",lab_status_ready:"Klar",lab_status_menu:"På menu",
      lab_sec_grundinfo:"Grundinfo",lab_sec_ing:"Ingredienser",lab_sec_steps:"Fremgangsmåde",lab_sec_tech:"Teknik & Tid",lab_sec_plating:"Anretning",lab_sec_wine:"Vine & parring",lab_sec_tests:"Testnoter",lab_sec_photos:"Billeder",
      lab_lbl_season:"Sæson",lab_lbl_portions:"Portioner",lab_lbl_concept:"Koncept & inspiration",
      lab_ph_concept:"Hvad er idéen bag retten? Hvad er sæsonen, fortællingen, teksturen…",
      lab_lbl_cooktime:"Tilberedning",lab_lbl_resttime:"Hvile / sous vide",lab_lbl_temp:"Temperatur",lab_lbl_platingtime:"Anretn. tid",
      lab_lbl_technique:"Primær teknik",lab_ph_technique:"fx ovn, sous vide, dampning, fermentering…",
      lab_lbl_plating_photo:"Tilføj anretningsbillede",lab_lbl_plating:"Beskrivelse af anretning",
      lab_ph_plating:"Beskriv opbygning, teksturer, løb, garnering, temperatur på tallerkenen…",
      lab_ph_wine:"Vinforslag, ølparring, mocktail, sake…",
      lab_add_ing:"+ Tilføj ingrediens",lab_ai_ing:"Analyser ingredienser med AI",
      lab_add_step:"+ Tilføj trin",lab_ph_step:"Beskriv trinnet…",
      lab_ai_wine:"AI: Foreslå vine baseret på ingredienser",
      lab_ai_desc:"Generer beskrivelse med AI",lab_ai_desc_loading:"Genererer…",lab_ai_desc_err:"Kunne ikke generere — prøv igen",
      lab_add_test:"+ Ny testrunde",lab_delete_dish:"Slet denne ret",
      lab_ai_fab:"Spørg AI",lab_ai_title:"Spørg AI om denne ret",lab_ai_thinking:"Tænker…",lab_ai_ph:"Stil et spørgsmål…",
      lab_ing_col_amt:"Mængde",lab_ing_col_unit:"Enhed",lab_ing_col_name:"Ingrediens",
      lab_ph_ing_amt:"mæng.",lab_ph_ing_unit:"enhed",lab_ph_ing_name:"Ingrediens…",lab_ph_ing_prep:"Forbehandling (fx brunois, blancheret, fermenteret…)",
      lab_empty_new:"Ingen retter endnu",lab_empty_new_sub:"Tryk på 'Ny ret' for at begynde",
      feed_follow:"Følg",feed_unfollow:"Følger",
      feed_like:"Synes godt om",feed_comment:"Kommentér",
      feed_comments:"Kommentarer",feed_comment_ph:"Skriv en kommentar…",
      feed_comment_send:"Send",feed_comment_empty:"Ingen kommentarer endnu",
      feed_no_results:"Ingen brugere fundet",
      feed_ago_now:"lige nu",feed_ago_min:"{0} min",feed_ago_h:"{0} t",feed_ago_day:"{0} d",
      shift_ai_btn:"Skriv med AI",shift_ai_loading:"Skriver…",shift_ai_err:"Kunne ikke generere — prøv igen",
      shift_start:"Start vagt",shift_active:"Vagt i gang",shift_end:"Afslut vagt",
      shift_title:"Afslut vagt",shift_duration:"Varighed: {0}",
      shift_caption_ph:"Skriv en opsummering af vagten…",
      shift_photo:"Tilføj billede",shift_post:"Afslut vagt",shift_post_feed:"Afslut og post til feed",shift_discard:"Slet vagt",
      shift_no_data:"Ingen aktivitet logget",
      counter_cat_lbl:"Kategori",
      new_cat_title:"Ny kategori",new_cat_lbl:"Navn",new_cat_save:"Opret",new_cat_cancel:"Annullér",
      new_cat_hint:"Claude genererer automatisk et ikon i baggrunden.",
      new_cat_btn:"+ Ny kategori",
      qlog_hint:"Enter for at logge",qlog_hint_full:"Enter for at logge · Esc for at lukke",
      catalog_title:"Katalog",cat_search_ph:"Søg i katalog...",new_cat_ph:"fx Anrettet, Sauce, Garnish...",
      onboard_sub:"Track din dag. Del med holdet.",onboard_btn:"Kom i gang",
      onboard_feat1_title:"Log hvad du laver",onboard_feat1_sub:"Opsæt kategorier og tæl anretninger, kokteails eller hvad du nu tracker",
      onboard_feat2_title:"Følg din vagt",onboard_feat2_sub:"Start en vagt og se et overblik over hvad du nåede — del det til feedet",
      onboard_feat3_title:"Mål dig med kollegerne",onboard_feat3_sub:"Følg andre, se leaderboardet og byg din trackinghistorik",
      img_only:"Kun billeder (JPEG, PNG, WebP)",
    },
    en:{
      tagline:"track your career",total_label:"career",
      tab_station:"Station",tab_wine:"Wine",tab_vagt:"Overview",tab_lab:"Lab",
      view_grid:"Grid view",view_list:"List view",
      qlog_ph:"Log what you've done — e.g. opened 500 Gillardeau oysters",
      loading:"Loading…",
      add_counter:"+ New counter",add_sub:"+ subcategory",sub_ph:"Type a variety…",
      add_wine:"+ Add wine manually",wine_search_ph:"Search your wines…",
      wine_db_head:"From the wine database",wine_searching:"Searching database…",
      wine_no_match:"No matches in database",wine_no_backend:"Connect backend to search",
      wine_fail:"Search failed — try again",
      wine_none:"No wines yet — search above to add.",
      wine_no_q:"No wines match the search.",
      wine_add:"Add",glasses:"Glasses",bottles:"Bottles",add_vintage:"+ vintage",
      w_type:"Type",wine_alle:"All",
      wine_type_rod:"Red",wine_type_hvid:"White",wine_type_rose:"Rosé",wine_type_mousserende:"Sparkling",wine_type_andet:"Other",
      wine_no_country:"No country",
      counter_new:"New counter",counter_edit:"Edit counter",
      counter_q:"What are you counting?",counter_ph:"e.g. Oysters opened",
      wine_new:"Add wine",wine_edit:"Edit wine",wine_scan:"Scan label",wine_scan_loading:"Reading label…",wine_scan_err:"Could not read the label — try again",wine_add_manual:"+ Add manually",
      wine_lineup:"Scan lineup",wine_lineup_loading:"Analysing lineup…",wine_lineup_err:"Could not analyse the image — try again",
      lineup_title:"Found in lineup",lineup_sub_fn:"{0} wines identified · {1} could not be read",lineup_add_all:"Stash it all",lineup_unreadable:"Label not clear",
      w_name:"Name",w_name_ph:"e.g. Tignanello",
      w_producer:"Producer",w_producer_ph:"e.g. Antinori",
      w_land:"Country",w_land_ph:"Italy",
      w_region:"Region",w_region_ph:"Tuscany",
      w_grape:"Grape",w_grape_ph:"Sangiovese",w_grape_add:"Add grape",
      w_vint:"Vintage",w_vint_ph:"2019",
      w_about:"About producer & wine",w_about_ph:"A short note on style, origin, or what makes this wine special…",w_about_btn:"About the wine",w_about_unknown:"We don't know this wine yet.",
      w_photo:"Photo",wine_add_photo:"Add photo",wine_change_photo:"Change photo",wine_remove_photo:"Remove",
      save:"Save",cancel:"Cancel",del:"Delete",
      ask_title:"Unknown item",ask_name_lbl:"Name",
      ask_as_counter:"As a new, standalone counter",ask_as_sub:"As a subcategory of:",
      ask_add:"Add",ask_skip:"Skip",
      undo:"Undo",
      numtray_add:"Add to",numtray_set:"Set {0} to",
      log_empty:"No entries yet — use the quick-log above",
      toast_unknown:"Didn't understand — try e.g. 'cut 500 onions'",
      toast_logged:"Logged: ",toast_nothing:"Nothing added",
      ask_no_match:"matches no existing category.",
      wines_count:"{0} wines",summary_glasses:"glasses",summary_bottles:"bottles",
      auth_email:"Email",auth_pw:"Password",
      auth_login:"Log in",auth_signup:"Create account",
      auth_sub_login:"Log in to continue",auth_sub_signup:"Let\u2019s create your account",
      auth_no_account:"No account?",auth_have_account:"Already have an account?",
      auth_create:"Create account",auth_to_login:"Log in",
      auth_forgot:"Forgot password?",auth_forgot_sent:"Check your email for a reset link",
      auth_signout:"Sign out",
      auth_splash_tag:"Track your craft.\nCelebrate your work.\nGrow every day.",
      auth_get_started:"Get started",auth_go_login:"Log in",
      auth_h1_login:"Welcome back 👋",auth_h1_signup:"Create your account",
      auth_or:"or",auth_google:"Continue with Google",auth_apple:"Continue with Apple",
      auth_oauth_err:"Could not sign in — try again",
      su_title1:"Create your account",su_sub1:"Let\u2019s get to know you",
      su_username_lbl:"Username",su_workplace_lbl:"Where do you work?",su_workplace_ph:"Restaurant name or location",su_workplace_hint:"e.g. The Rooftop, Copenhagen",
      su_role_lbl:"Role",su_continue:"Continue",
      su_title2:"Almost there!",su_sub2:"Confirm your details",
      su_row_user:"Username",su_row_work:"Workplace",su_row_role:"Role",su_edit:"Edit",
      su_save:"Save & continue",su_back:"Back",su_username_needed:"Choose a username first",
      su_role_needed:"Pick your role",
      su_role_chef:"Chef",su_role_chef_sub:"Track kitchen prep",
      su_role_waiter:"Waiter / Waitress",su_role_waiter_sub:"Track service & tables",
      su_role_bartender:"Bartender",su_role_bartender_sub:"Track drinks & bar",
      su_role_barista:"Barista",su_role_barista_sub:"Track coffee & drinks",
      tab_social:"Leaderboard",
      challenge_title:"Weekly challenge",challenge_days:"days left",challenge_ends:"{0} days left",
      lb_title:"Weekly leaderboard",lb_week:"week from",lb_anon:"Anonymous",lb_you:"you",lb_empty:"No data yet",
      stab_global:"🌍 Global",stab_challenge:"🏆 Weekly",
      lb_period_week:"Week",lb_period_month:"Month",lb_period_all:"All time",
      lb_total_pts:"pts total",team_lb_title:"Your team",team_no_team:"Not on a team yet",
      team_title:"Team",team_create_ph:"e.g. Noma Kitchen",team_create_btn:"Create team",
      team_join_ph:"XXXXXX",team_join_btn:"Join",team_or:"or",
      team_create_or_join:"Create a team or join one with an invite code.",
      team_not_found:"Team not found",team_copy:"Copy",team_copied:"Copied",
      team_this_week:"This week",
      profile_username_lbl:"Username",profile_nick_lbl:"Nickname",profile_nick_ph:"e.g. Simon",
      profile_prof_lbl:"Profession",profile_prof_default:"Select profession",
      profile_save:"Save",
      username_checking:"Checking…",username_ok:"Available",username_taken:"Taken",username_invalid:"Letters, numbers and _ only (3-30 chars)",
      username_setup_title:"Choose a username",username_setup_hint:"Your username lets others find and follow you. You can change it later.",
      username_setup_save:"Save username",username_setup_skip:"Skip for now",
      follow_req_title:"Follow requests",follow_req_accept:"Accept",follow_req_reject:"Decline",
      feed_requested:"Requested",
      new_badge:"New badge",
      professions:["Chef","Waiter / Waitress","Bartender","Barista","Sommelier","Other"],
      streak_day:"1 day in a row",streak_days:"{0} days in a row",
      offline_pending:"{0} pending sync",
      tab_feed:"Feed",
      feed_tab_mine:"My feed",feed_tab_discover:"Discover",
      lab_sub:"Experiment with your dishes",
      lab_new:"New experiment",
      lab_photo_lbl:"Take a photo",
      lab_photo_sub:"Tap to choose photo",
      lab_analyze:"Analyze with AI",
      lab_cancel:"Cancel",
      lab_save:"Save experiment",
      lab_loading:"AI is analyzing the dish…",
      lab_delete:"Delete",
      lab_close:"Close",
      lab_empty_title:"No experiments yet",
      lab_empty_sub:"Take a photo of a dish and let AI elevate it",
      lab_new_dish:"New dish",lab_filter_all:"All",lab_filter_idea:"Idea",lab_filter_testing:"Test",lab_filter_ready:"Ready",lab_filter_menu:"On menu",
      lab_name_ph:"Dish name…",lab_hero_add:"Add hero photo",
      lab_status_idea:"Idea",lab_status_testing:"Test",lab_status_ready:"Ready",lab_status_menu:"On menu",
      lab_sec_grundinfo:"Overview",lab_sec_ing:"Ingredients",lab_sec_steps:"Method",lab_sec_tech:"Technique & Timing",lab_sec_plating:"Plating",lab_sec_wine:"Wine & Pairing",lab_sec_tests:"Test notes",lab_sec_photos:"Photos",
      lab_lbl_season:"Season",lab_lbl_portions:"Portions",lab_lbl_concept:"Concept & inspiration",
      lab_ph_concept:"What's the idea behind this dish? The season, story, texture…",
      lab_lbl_cooktime:"Cook time",lab_lbl_resttime:"Rest / sous vide",lab_lbl_temp:"Temperature",lab_lbl_platingtime:"Plating time",
      lab_lbl_technique:"Primary technique",lab_ph_technique:"e.g. oven, sous vide, steaming, fermentation…",
      lab_lbl_plating_photo:"Add plating photo",lab_lbl_plating:"Plating description",
      lab_ph_plating:"Describe the build, textures, sauces, garnish, plate temperature…",
      lab_ph_wine:"Wine pairing, beer pairing, mocktail, sake…",
      lab_add_ing:"+ Add ingredient",lab_ai_ing:"Analyze ingredients with AI",
      lab_add_step:"+ Add step",lab_ph_step:"Describe the step…",
      lab_ai_wine:"AI: Suggest wine based on ingredients",
      lab_ai_desc:"Generate description with AI",lab_ai_desc_loading:"Generating…",lab_ai_desc_err:"Could not generate — try again",
      lab_add_test:"+ New test round",lab_delete_dish:"Delete this dish",
      lab_ai_fab:"Ask AI",lab_ai_title:"Ask AI about this dish",lab_ai_thinking:"Thinking…",lab_ai_ph:"Ask a question…",
      lab_ing_col_amt:"Amount",lab_ing_col_unit:"Unit",lab_ing_col_name:"Ingredient",
      lab_ph_ing_amt:"amt.",lab_ph_ing_unit:"unit",lab_ph_ing_name:"Ingredient…",lab_ph_ing_prep:"Prep (e.g. brunoise, blanched, fermented…)",
      lab_empty_new:"No dishes yet",lab_empty_new_sub:"Tap 'New dish' to get started",
      feed_empty:"Follow someone to see their activity here",
      feed_empty_own:"You have not posted anything yet",
      feed_load_more:"Load more",
      feed_search_ph:"Search by nickname…",
      feed_follow:"Follow",feed_unfollow:"Following",
      feed_like:"Like",feed_comment:"Comment",
      feed_comments:"Comments",feed_comment_ph:"Write a comment…",
      feed_comment_send:"Send",feed_comment_empty:"No comments yet",
      feed_no_results:"No users found",
      feed_ago_now:"just now",feed_ago_min:"{0}m",feed_ago_h:"{0}h",feed_ago_day:"{0}d",
      shift_ai_btn:"Write with AI",shift_ai_loading:"Writing…",shift_ai_err:"Could not generate — try again",
      shift_start:"Start shift",shift_active:"Shift in progress",shift_end:"End shift",
      shift_title:"End shift",shift_duration:"Duration: {0}",
      shift_caption_ph:"Write a shift summary…",
      shift_photo:"Add photo",shift_post:"End shift",shift_post_feed:"End & post to feed",shift_discard:"Delete shift",
      shift_no_data:"No activity logged",
      counter_cat_lbl:"Category",
      new_cat_title:"New category",new_cat_lbl:"Name",new_cat_save:"Create",new_cat_cancel:"Cancel",
      new_cat_hint:"Claude will automatically generate an icon in the background.",
      new_cat_btn:"+ New category",
      qlog_hint:"Enter to log",qlog_hint_full:"Enter to log · Esc to close",
      catalog_title:"Catalogue",cat_search_ph:"Search catalogue...",new_cat_ph:"e.g. Plated, Sauce, Garnish...",
      onboard_sub:"Track your day. Share with the team.",onboard_btn:"Get started",
      onboard_feat1_title:"Log what you do",onboard_feat1_sub:"Set up categories and count dishes, cocktails, or whatever you track",
      onboard_feat2_title:"Track your shift",onboard_feat2_sub:"Start a shift and see an overview of what you accomplished — share it to feed",
      onboard_feat3_title:"Compete with colleagues",onboard_feat3_sub:"Follow others, check the leaderboard, and build your tracking history",
      img_only:"Images only (JPEG, PNG, WebP)",
    }
  };
  let lang=localStorage.getItem("mise_lang")||"da";
  function t(key,...args){let s=(LANGS[lang]&&LANGS[lang][key])||LANGS.da[key]||key;args.forEach((a,i)=>s=s.replace("{"+i+"}",a));return s;}
  function translateUI(){
    document.documentElement.lang=lang;
    const langDl=$("#langDrawerLbl");if(langDl)langDl.textContent=lang==="da"?"English":"Dansk";
    const tglEl=$("#tagline");if(tglEl)tglEl.textContent=t("tagline");
    $("#totalLbl").textContent=t("total_label");
    $("#loading").textContent=t("loading");
    $("#qlogInput").placeholder=t("qlog_ph");
    const _stAiI=document.getElementById("stAiInp");if(_stAiI)_stAiI.placeholder=lang==="da"?"Log hvad du lavede…":"Log what you did…";
    $("#wineSearch").placeholder=t("wine_search_ph");
    $("#counterQLabel").textContent=t("counter_q");
    $("#counterCatLbl").textContent=t("counter_cat_lbl");
    $("#counterLabelInput").placeholder=t("counter_ph");
    $("#newCatTitle").textContent=t("new_cat_title");
    $("#newCatLbl").textContent=t("new_cat_lbl");
    $("#newCatHint").textContent=t("new_cat_hint");
    $("#newCatSave").textContent=t("new_cat_save");
    $("#newCatCancel").textContent=t("new_cat_cancel");
    $("#counterSave").textContent=t("save");
    $("#counterCancel").textContent=t("cancel");
    $("#counterDelete").textContent=t("del");
    const winePageScanLbl=$("#winePageScanLbl");if(winePageScanLbl)winePageScanLbl.textContent=t("wine_scan");
    const addWineBtnEl=$("#addWineBtn");if(addWineBtnEl)addWineBtnEl.textContent=t("wine_add_manual");
    const waScanLbl=document.getElementById("waScanLbl");if(waScanLbl)waScanLbl.textContent=t("wine_scan");
    const waEditBtn=document.getElementById("wAboutEditBtn");if(waEditBtn&&waEditBtn.style.display!=="none")waEditBtn.textContent=lang==="da"?"✏ Rediger":"✏ Edit";
    document.querySelectorAll(".wa-type-btn").forEach(b=>{b.textContent=t("wine_type_"+b.dataset.wtype);});
    const waName=document.getElementById("waName");if(waName)waName.placeholder=t("w_name_ph");
    const waProducer=document.getElementById("waProducer");if(waProducer)waProducer.placeholder=t("w_producer_ph");
    const waLand=document.getElementById("waLand");if(waLand)waLand.placeholder=t("w_land_ph");
    const waRegion=document.getElementById("waRegion");if(waRegion)waRegion.placeholder=t("w_region_ph");
    const waVint=document.getElementById("waVint");if(waVint)waVint.placeholder=t("w_vint_ph");
    const waSave=document.getElementById("waSave");if(waSave)waSave.textContent=t("save");
    const waCancel=document.getElementById("waCancel");if(waCancel)waCancel.textContent=t("cancel");
    const waDelete=document.getElementById("waDelete");if(waDelete)waDelete.textContent=t("del");
    const waPhotoBtn=document.getElementById("waPhotoBtn");if(waPhotoBtn&&document.getElementById("waPhotoPreview")&&document.getElementById("waPhotoPreview").style.display==="none")waPhotoBtn.textContent=lang==="da"?"+ Billede":"+ Photo";
    $("#askTitle").textContent=t("ask_title");
    $("#askNameLbl").textContent=t("ask_name_lbl");
    $("#askOptCounter").textContent=t("ask_as_counter");
    $("#askOptSub").textContent=t("ask_as_sub");
    $("#askAdd").textContent=t("ask_add");
    $("#askSkip").textContent=t("ask_skip");
    $("#toastUndo").textContent=t("undo");
    $("#authEmailLbl").textContent=t("auth_email");
    $("#authPwLbl").textContent=t("auth_pw");
    const _so=$("#signOutBtn");if(_so)_so.textContent=t("auth_signout");
    renderStreak();
    const mProf=$("#menuDrawerProfileLbl");if(mProf)mProf.textContent=lang==="da"?"Profil":"Profile";
    const mSoc=$("#menuDrawerSocialLbl");if(mSoc)mSoc.textContent=t("tab_social");
    const mHist=$("#menuDrawerHistoryLbl");if(mHist)mHist.textContent=lang==="da"?"Historik":"History";
    const mLab=$("#menuDrawerLabLbl");if(mLab)mLab.textContent=t("tab_lab");
    const mRes=$("#menuDrawerResumeLbl");if(mRes)mRes.textContent=lang==="da"?"Lav dit CV":"Create your CV";
    const rTit=$("#resumeTitle");if(rTit)rTit.textContent=lang==="da"?"Dit CV":"Your CV";
    const rExp=$("#resumeExportLbl");if(rExp)rExp.textContent=lang==="da"?"Del":"Share";
    const rST=$("#resumeShareTitle");if(rST)rST.textContent=lang==="da"?"Sådan ser dit CV ud":"This is your CV";
    const rSD=$("#resumeShareDoLbl");if(rSD)rSD.textContent=lang==="da"?"Del CV":"Share CV";
    const bVin=$("#bnav-lbl-vin");if(bVin)bVin.textContent=t("tab_wine");
    const bStats=$("#bnav-lbl-stats");if(bStats)bStats.textContent="Stats";
    const bFeed=$("#bnav-lbl-feed");if(bFeed)bFeed.textContent=t("tab_feed");
    const hLogT=$("#historyOutsideTitle");if(hLogT)hLogT.textContent=lang==="da"?"Uden for vagt":"Outside a shift";
    const sCatT=$("#statsCatTitle");if(sCatT)sCatT.textContent=lang==="da"?"Kategorier":"Categories";
    const sAskT=$("#statsAskTitle");if(sAskT)sAskT.textContent=lang==="da"?"Spørg om dine stats":"Ask about your stats";
    const sAskI=$("#statsAskInput");if(sAskI)sAskI.placeholder=lang==="da"?"fx: Hvornår havde jeg min længste vagt?":"e.g. When was my longest shift?";
    const sToA=$("#statsToAchieveLbl");if(sToA)sToA.textContent=lang==="da"?"At opnå":"To achieve";
    // Paywall
    const pwT=$("#paywallTitle");if(pwT)pwT.textContent=lang==="da"?"Lås alt op med Pro":"Unlock everything with Pro";
    const pwS=$("#paywallSub");if(pwS)pwS.textContent=lang==="da"?"Få det fulde værktøj til dit håndværk.":"The full toolkit for your craft.";
    const pwC=$("#paywallCta");if(pwC)pwC.textContent=lang==="da"?"Opgrader til Pro":"Upgrade to Pro";
    const pwF=$("#paywallFine");if(pwF)pwF.textContent=lang==="da"?"Basics er altid gratis.":"Basics are always free.";
    const pwFeats=$("#paywallFeats");if(pwFeats){const F=lang==="da"?[["🍷","Vin-styring — kælder, ratings, label-scanning"],["🍳","The Lab — opskriftsudvikling, hold-deling, kogebøger"],["✨","Smart AI-logning — skriv i naturligt sprog"],["📊","Spørg om dine stats i naturligt sprog"]]:[["🍷","Wine management — cellar, ratings, label scanning"],["🍳","The Lab — recipe development, team sharing, cookbooks"],["✨","Smart AI logging — write in natural language"],["📊","Ask about your stats in natural language"]];pwFeats.innerHTML=F.map(f=>'<li><span class="pf-ic">'+f[0]+'</span><span>'+esc(f[1])+'</span></li>').join("");}
    const snTitle=$("#shiftNudgeTitle");if(snTitle)snTitle.textContent=lang==="da"?"Ser ud til du er i gang":"Looks like you're working";
    const snSub=$("#shiftNudgeSub");if(snSub)snSub.textContent=lang==="da"?"Ingen vagt kører — hvor længe har du arbejdet?":"No shift is running — how long have you been working?";
    const snDismiss=$("#shiftNudgeDismiss");if(snDismiss)snDismiss.textContent=lang==="da"?"Nej tak":"No thanks";
    const snChips={0:lang==="da"?"Lige nu":"Just now",15:"15 min",30:"30 min",60:lang==="da"?"1 time":"1 hour",90:lang==="da"?"1,5 time":"1.5 hours",120:lang==="da"?"2 timer":"2 hours"};
    document.querySelectorAll(".shift-nudge-chip").forEach(btn=>{const v=snChips[btn.dataset.min];if(v)btn.textContent=v;});
    const dTitle=$("#logDrawerTitle");if(dTitle)dTitle.textContent=lang==="da"?"Menu":"Menu";
    const fSearch=$("#feedSearch");if(fSearch)fSearch.placeholder=t("feed_search_ph");
    const fcl=$("#feedComposeLbl");if(fcl)fcl.textContent=lang==="da"?"Del et foto…":"Share a photo…";
    const fpt=$("#feedPostTitle");if(fpt)fpt.textContent=lang==="da"?"Del et foto":"Share a photo";
    const fppl=$("#feedPostPickLbl");if(fppl)fppl.textContent=lang==="da"?"Vælg et foto":"Pick a photo";
    const fpc=$("#feedPostCaption");if(fpc)fpc.placeholder=lang==="da"?"Skriv en note (valgfrit)…":"Add a note (optional)…";
    const fpd=$("#feedPostDo");if(fpd)fpd.textContent=lang==="da"?"Del":"Share";
    const cSend=$("#commentSend");if(cSend)cSend.textContent=t("feed_comment_send");
    const cInput=$("#commentInput");if(cInput)cInput.placeholder=t("feed_comment_ph");
    const shiftStartBtn=$("#shiftStartBtn");if(shiftStartBtn)shiftStartBtn.textContent=t("shift_start");
    const shiftEndBtn=$("#shiftEndBtn");if(shiftEndBtn)shiftEndBtn.textContent=t("shift_end");
    const shiftLabel=$("#shiftLabel");if(shiftLabel)shiftLabel.textContent=t("shift_active");
    const shiftPost=$("#shiftPost");if(shiftPost)shiftPost.textContent=t("shift_post");
    const shiftFeedPost=$("#shiftFeedPost");if(shiftFeedPost)shiftFeedPost.textContent=t("shift_post_feed");
    const shiftDiscard=$("#shiftDiscard");if(shiftDiscard)shiftDiscard.textContent=t("shift_discard");
    const shiftCap=$("#shiftCaption");if(shiftCap)shiftCap.placeholder=t("shift_caption_ph");
    const shiftPhotoBtn=$("#shiftPhotoBtn");if(shiftPhotoBtn)shiftPhotoBtn.textContent=t("shift_photo");
    const lbTitle=$("#lbTitle");if(lbTitle)lbTitle.textContent=t("lb_title");
    const teamTitle=$("#teamTitle");if(teamTitle)teamTitle.textContent=t("team_title");
    const pSave=$("#profileSave");if(pSave)pSave.textContent=t("profile_save");
    const pNick=$("#profileNick");if(pNick)pNick.placeholder=t("profile_nick_ph");
    const pNickLbl=$("#profileNickLbl");if(pNickLbl)pNickLbl.textContent=t("profile_nick_lbl");
    const pUsernameLbl=$("#profileUsernameLbl");if(pUsernameLbl)pUsernameLbl.textContent=t("profile_username_lbl");
    const pProfLbl=$("#profileProfLbl");if(pProfLbl)pProfLbl.textContent=t("profile_prof_lbl");
    const pAcctT=$("#profileAccountTitle");if(pAcctT)pAcctT.textContent=lang==="da"?"Konto":"Account";
    const pPrefsT=$("#profilePrefsTitle");if(pPrefsT)pPrefsT.textContent=lang==="da"?"Indstillinger":"Preferences";
    // Auth: splash + form
    const aTag=$("#authSplashTag");if(aTag)aTag.innerHTML=esc(t("auth_splash_tag")).replace(/\n/g,"<br>");
    const aGet=$("#authGetStarted");if(aGet)aGet.textContent=t("auth_get_started");
    const aGoLogin=$("#authGoLogin");if(aGoLogin)aGoLogin.textContent=t("auth_go_login");
    const aDivLbl=$("#authDividerLbl");if(aDivLbl)aDivLbl.textContent=t("auth_or");
    const aGoogleLbl=$("#authGoogleLbl");if(aGoogleLbl)aGoogleLbl.textContent=t("auth_google");
    const aAppleLbl=$("#authAppleLbl");if(aAppleLbl)aAppleLbl.textContent=t("auth_apple");
    // Signup-setup (rolle/workplace + bekræft)
    const suUL=$("#suUsernameLbl");if(suUL)suUL.textContent=t("su_username_lbl");
    const suWL=$("#suWorkplaceLbl");if(suWL)suWL.textContent=t("su_workplace_lbl");
    const suWH=$("#suWorkplaceHint");if(suWH)suWH.textContent=t("su_workplace_hint");
    const suWI=$("#suWorkplace");if(suWI)suWI.placeholder=t("su_workplace_ph");
    const suRL=$("#suRoleLbl");if(suRL)suRL.textContent=t("su_role_lbl");
    const suCont=$("#suContinue");if(suCont)suCont.textContent=t("su_continue");
    const suT2=$("#suTitle2");if(suT2)suT2.textContent=t("su_title2");
    const suS2=$("#suSub2");if(suS2)suS2.textContent=t("su_sub2");
    const suRUL=$("#suRowUserLbl");if(suRUL)suRUL.textContent=t("su_row_user");
    const suRWL=$("#suRowWorkLbl");if(suRWL)suRWL.textContent=t("su_row_work");
    const suRRL=$("#suRowRoleLbl");if(suRRL)suRRL.textContent=t("su_row_role");
    document.querySelectorAll(".su-edit").forEach(b=>b.textContent=t("su_edit"));
    const suSaveBtn=$("#suSave");if(suSaveBtn)suSaveBtn.textContent=t("su_save");
    const suBackBtn=$("#suBack");if(suBackBtn)suBackBtn.textContent=t("su_back");
    // The Lab
    const labNewLbl=$("#labNewBtnLbl");if(labNewLbl)labNewLbl.textContent=t("lab_new_dish");
    const labFAll=$("#labFilterAll");if(labFAll)labFAll.textContent=t("lab_filter_all");
    const labFIdea=$("#labFilterIdea");if(labFIdea)labFIdea.textContent=t("lab_filter_idea");
    const labFTesting=$("#labFilterTesting");if(labFTesting)labFTesting.textContent=t("lab_filter_testing");
    const labFReady=$("#labFilterReady");if(labFReady)labFReady.textContent=t("lab_filter_ready");
    const labFMenu=$("#labFilterMenu");if(labFMenu)labFMenu.textContent=t("lab_filter_menu");
    const deNameEl=$("#deName");if(deNameEl)deNameEl.placeholder=t("lab_name_ph");
    const deHeroAddLbl=$("#deHeroAddLbl");if(deHeroAddLbl)deHeroAddLbl.textContent=t("lab_hero_add");
    const dsChipIdea=$("#dsChipIdea");if(dsChipIdea)dsChipIdea.textContent=t("lab_status_idea");
    const dsChipTesting=$("#dsChipTesting");if(dsChipTesting)dsChipTesting.textContent=t("lab_status_testing");
    const dsChipReady=$("#dsChipReady");if(dsChipReady)dsChipReady.textContent=t("lab_status_ready");
    const dsChipMenu=$("#dsChipMenu");if(dsChipMenu)dsChipMenu.textContent=t("lab_status_menu");
    const dsTGrund=$("#dsTitleGrundinfo");if(dsTGrund)dsTGrund.textContent=t("lab_sec_grundinfo");
    const dsTIng=$("#dsTitleIng");if(dsTIng)dsTIng.textContent=t("lab_sec_ing");
    const dsTSteps=$("#dsTitleSteps");if(dsTSteps)dsTSteps.textContent=t("lab_sec_steps");
    const dsTTech=$("#dsTitleTech");if(dsTTech)dsTTech.textContent=t("lab_sec_tech");
    const dsTPlating=$("#dsTitlePlating");if(dsTPlating)dsTPlating.textContent=t("lab_sec_plating");
    const dsTWine=$("#dsTitleWine");if(dsTWine)dsTWine.textContent=t("lab_sec_wine");
    const dsTTest=$("#dsTitleTest");if(dsTTest)dsTTest.textContent=t("lab_sec_tests");
    const dsTPhotos=$("#dsTitlePhotos");if(dsTPhotos)dsTPhotos.textContent=t("lab_sec_photos");
    const deViewLbl=$("#deViewLbl");if(deViewLbl)deViewLbl.textContent=lang==="da"?"Se opskrift":"View recipe";
    const deLblSeason=$("#deLblSeason");if(deLblSeason)deLblSeason.textContent=t("lab_lbl_season");
    const deLblPortions=$("#deLblPortions");if(deLblPortions)deLblPortions.textContent=t("lab_lbl_portions");
    const deLblConcept=$("#deLblConcept");if(deLblConcept)deLblConcept.textContent=t("lab_lbl_concept");
    const deConceptEl=$("#deConcept");if(deConceptEl)deConceptEl.placeholder=t("lab_ph_concept");
    const deLblCookTime=$("#deLblCookTime");if(deLblCookTime)deLblCookTime.textContent=t("lab_lbl_cooktime");
    const deLblRestTime=$("#deLblRestTime");if(deLblRestTime)deLblRestTime.textContent=t("lab_lbl_resttime");
    const deLblMainTemp=$("#deLblMainTemp");if(deLblMainTemp)deLblMainTemp.textContent=t("lab_lbl_temp");
    const deLblPlatingTime=$("#deLblPlatingTime");if(deLblPlatingTime)deLblPlatingTime.textContent=t("lab_lbl_platingtime");
    const deLblTech=$("#deLblTechnique");if(deLblTech)deLblTech.textContent=t("lab_lbl_technique");
    const deTechEl=$("#deTechnique");if(deTechEl)deTechEl.placeholder=t("lab_ph_technique");
    const deLblPlatingPhoto=$("#deLblPlatingPhoto");if(deLblPlatingPhoto)deLblPlatingPhoto.textContent=t("lab_lbl_plating_photo");
    const deLblPlating=$("#deLblPlating");if(deLblPlating)deLblPlating.textContent=t("lab_lbl_plating");
    const dePlatingEl=$("#dePlating");if(dePlatingEl)dePlatingEl.placeholder=t("lab_ph_plating");
    const deWineEl=$("#deWine");if(deWineEl)deWineEl.placeholder=t("lab_ph_wine");
    const ingAddBtn=$("#ingAddBtn");if(ingAddBtn)ingAddBtn.textContent=t("lab_add_ing");
    const ingAiBtnLbl=$("#ingAiBtnLbl");if(ingAiBtnLbl)ingAiBtnLbl.textContent=t("lab_ai_ing");
    const stepAddBtn=$("#stepAddBtn");if(stepAddBtn)stepAddBtn.textContent=t("lab_add_step");
    const wineAiBtnLbl=$("#wineAiBtnLbl");if(wineAiBtnLbl)wineAiBtnLbl.textContent=t("lab_ai_wine");
    const dishDescAiBtnLbl=$("#dishDescAiBtnLbl");if(dishDescAiBtnLbl)dishDescAiBtnLbl.textContent=t("lab_ai_desc");
    const testAddBtn=$("#testAddBtn");if(testAddBtn)testAddBtn.textContent=t("lab_add_test");
    const deIngColAmt=$("#deIngColAmt");if(deIngColAmt)deIngColAmt.textContent=t("lab_ing_col_amt");
    const deIngColUnit=$("#deIngColUnit");if(deIngColUnit)deIngColUnit.textContent=t("lab_ing_col_unit");
    const deIngColName=$("#deIngColName");if(deIngColName)deIngColName.textContent=t("lab_ing_col_name");
    const aiFabLbl=$("#aiFabLbl");if(aiFabLbl)aiFabLbl.textContent=t("lab_ai_fab");
    const aiSheetTitle=$("#aiSheetTitle");if(aiSheetTitle)aiSheetTitle.textContent=t("lab_ai_title");
    const aiLoadingTxt=$("#aiLoadingTxt");if(aiLoadingTxt)aiLoadingTxt.textContent=t("lab_ai_thinking");
    const aiInputEl=$("#aiInput");if(aiInputEl)aiInputEl.placeholder=t("lab_ai_ph");
    // Catalog & new category
    const catalogTitleEl=$("#catalogTitle");if(catalogTitleEl)catalogTitleEl.textContent=t("catalog_title");
    const catalogSearchEl=$("#catalogSearch");if(catalogSearchEl)catalogSearchEl.placeholder=t("cat_search_ph");
    const newCatInputEl=$("#newCatInput");if(newCatInputEl)newCatInputEl.placeholder=t("new_cat_ph");
    // Onboarding
    const obSub=$("#onboardSub");if(obSub)obSub.textContent=t("onboard_sub");
    const obBtn=$("#onboardDone");if(obBtn)obBtn.textContent=t("onboard_btn");
    const obF1T=$("#onboardFeat1Title");if(obF1T)obF1T.textContent=t("onboard_feat1_title");
    const obF1S=$("#onboardFeat1Sub");if(obF1S)obF1S.textContent=t("onboard_feat1_sub");
    const obF2T=$("#onboardFeat2Title");if(obF2T)obF2T.textContent=t("onboard_feat2_title");
    const obF2S=$("#onboardFeat2Sub");if(obF2S)obF2S.textContent=t("onboard_feat2_sub");
    const obF3T=$("#onboardFeat3Title");if(obF3T)obF3T.textContent=t("onboard_feat3_title");
    const obF3S=$("#onboardFeat3Sub");if(obF3S)obF3S.textContent=t("onboard_feat3_sub");
    const obLegal=$("#onboardLegal");if(obLegal)obLegal.innerHTML=lang==="da"
      ?"Ved at fortsætte accepterer du vores <a href=\"https://tracker-production-1a62.up.railway.app/terms.html\">vilkår</a> og <a href=\"https://tracker-production-1a62.up.railway.app/privacy.html\">privatlivspolitik</a>"
      :"By continuing you accept our <a href=\"https://tracker-production-1a62.up.railway.app/terms.html\">terms</a> and <a href=\"https://tracker-production-1a62.up.railway.app/privacy.html\">privacy policy</a>";
    const authLegal=$("#authLegal");if(authLegal)authLegal.innerHTML=lang==="da"
      ?"Ved at fortsætte accepterer du vores <a href=\"https://tracker-production-1a62.up.railway.app/privacy.html\">privatlivspolitik</a> og <a href=\"https://tracker-production-1a62.up.railway.app/terms.html\">vilkår</a>"
      :"By continuing you accept our <a href=\"https://tracker-production-1a62.up.railway.app/privacy.html\">privacy policy</a> and <a href=\"https://tracker-production-1a62.up.railway.app/terms.html\">terms</a>";
    // Bottom nav — The Lab stays "The Lab" in both languages
    const bLab=$("#bnav-lbl-lab");if(bLab)bLab.textContent=t("tab_lab");
    const bVagt=$("#bnav-lbl-vagt");if(bVagt)bVagt.textContent=t("tab_vagt");
    // qlog hint (initial HTML)
    const qlogHintEl=$("#qlogOvHint");if(qlogHintEl)qlogHintEl.textContent=t("qlog_hint");
    const wineLineupLbl=$("#wineLineupLbl");if(wineLineupLbl)wineLineupLbl.textContent=t("wine_lineup");
    const winePageScanSub=$("#winePageScanSub");if(winePageScanSub)winePageScanSub.textContent=lang==="da"?"AI læser etiketten":"AI reads the label";
    const wineLineupSub=$("#wineLineupSub");if(wineLineupSub)wineLineupSub.textContent=lang==="da"?"Flere flasker på ét billede":"Several bottles in one shot";
    const lineupTitle=$("#lineupTitle");if(lineupTitle)lineupTitle.textContent=t("lineup_title");
    const lineupAddAll=$("#lineupAddAll");if(lineupAddAll)lineupAddAll.textContent=t("lineup_add_all");
    const lineupClose=$("#lineupClose");if(lineupClose)lineupClose.textContent=lang==="da"?"Luk":"Close";
  }
  function setLang(l){lang=l;localStorage.setItem("mise_lang",l);translateUI();renderCounters();renderWines();renderLogView();renderVagt();}
  var _langLink=$("#langDrawerLink");if(_langLink)_langLink.addEventListener("click",()=>{setLang(lang==="da"?"en":"da");haptic(15);});

  // Translations for default counter/sub labels — user-created labels stay as-is
  const LABEL_TRANSLATIONS={
    "Østers åbnet":        {en:"Oysters opened"},
    "Løg snittet":         {en:"Onions cut"},
    "Flasker åbnet":       {en:"Bottles opened"},
    "Couverter serveret":  {en:"Covers served"},
    "Uden type":           {en:"Unspecified"},
    "Gul løg":             {en:"Yellow onion"},
    "Rødløg":              {en:"Red onion"},
    "Skalotteløg":         {en:"Shallot"},
    "Forårsløg":           {en:"Spring onion"},
    "Perleløg":            {en:"Pearl onion"},
    "Spanske løg":         {en:"Spanish onion"},
    "Bananskalotte":       {en:"Banana shallot"},
    "Porre":               {en:"Leek"},
    "Konventionel vin":    {en:"Conventional wine"},
    "Naturvin":            {en:"Natural wine"},
  };
  // Oversættelses-opslag bygges fra CATALOG (da<->en) + den manuelle tabel — begge retninger
  function tLabel(label){
    if(!label)return label;
    const key=label.toLowerCase();
    if(lang==="da")return _LBL_EN2DA[key]||label;
    return _LBL_DA2EN[key]||label;
  }

  const CATS=[
    {id:"aabnet-mad",da:"Åbnet mad",en:"Opened food",
     icon:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 32 C5 20 12 10 24 8 C34 8 38 18 36 28 C34 40 26 52 16 54 C9 52 4 42 5 32Z" stroke-width="2.5"/><path d="M5 32 Q16 10 24 8" stroke-width="1.2"/><path d="M5 32 Q22 18 36 28" stroke-width="1.2"/><path d="M5 32 Q10 44 16 54" stroke-width="1.2"/><ellipse cx="20" cy="32" rx="10" ry="8" fill="currentColor" stroke="none"/><circle cx="5" cy="32" r="3.5" fill="currentColor" stroke="none"/><path d="M51 8 L57 14 L57 36 L45 36 L45 14 Z" fill="currentColor" stroke="none"/><rect x="43" y="36" width="16" height="5" rx="2" fill="currentColor" stroke="none"/><rect x="46" y="41" width="10" height="18" rx="4" fill="currentColor" stroke="none"/><circle cx="51" cy="47" r="1.8" fill="var(--surface)" stroke="none"/><circle cx="51" cy="53" r="1.8" fill="var(--surface)" stroke="none"/></svg>'},
    {id:"aabnet-drikke",da:"Åbnet drikke",en:"Opened drinks",
     icon:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="18" y="2" width="10" height="6" rx="2.5" fill="currentColor" stroke="none"/><path d="M19 8 L19 18 M27 8 L27 18"/><path d="M19 18 C17 21 14 24 14 28"/><path d="M27 18 C29 21 32 24 32 28"/><path d="M14 28 L14 56 Q14 62 18 62 L28 62 Q32 62 32 56 L32 28"/><path d="M14 38 L32 38 M14 50 L32 50" stroke-width="1.2"/><line x1="40" y1="10" x2="60" y2="10" stroke-width="3"/><circle cx="40" cy="10" r="2.5" fill="currentColor" stroke="none"/><circle cx="60" cy="10" r="2.5" fill="currentColor" stroke="none"/><line x1="50" y1="10" x2="50" y2="18" stroke-width="2.5"/><path d="M50 18 C46 19 46 23 50 24 C54 25 54 29 50 30 C46 31 46 35 50 36 C54 37 53 40 51 42" stroke-width="2"/><path d="M51 42 L49 46" stroke-width="1.5"/></svg>'},
    {id:"snittet",da:"Snittet",en:"Cut",
     icon:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 56 L42 12 L54 20 L20 58Z" fill="currentColor" stroke="none"/><rect x="4" y="53" width="5" height="10" rx="2" fill="currentColor" stroke="none"/><path d="M2 54 C2 50 4 48 7 48 L7 62 C4 62 2 60 2 56Z" fill="currentColor" stroke="none"/><circle cx="4.5" cy="52" r="1.5" fill="var(--surface)" stroke="none"/><circle cx="4.5" cy="57" r="1.5" fill="var(--surface)" stroke="none"/><line x1="36" y1="26" x2="36" y2="62" stroke-width="2"/><path d="M36 26 C52 26 62 34 62 44 C62 54 52 62 36 62" stroke-width="2.5"/><path d="M36 31 C49 31 57 37 57 44 C57 51 49 57 36 57" stroke-width="1.8"/><path d="M36 37 C46 37 52 40 52 44 C52 48 46 51 36 51" stroke-width="1.5"/><path d="M36 42 C40 42 43 43 43 44 C43 45 40 46 36 46" stroke-width="1.2"/><path d="M34 26 C33 22 34 20 36 18" stroke-width="1.5"/><path d="M38 26 C39 22 38 20 36 18" stroke-width="1.5"/></svg>'},
    {id:"tilberedt",da:"Tilberedt",en:"Prepared",
     icon:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14 C20 10 22 8 20 4" stroke-width="1.8"/><path d="M32 12 C32 8 34 6 32 2" stroke-width="1.8"/><path d="M44 14 C44 10 46 8 44 4" stroke-width="1.8"/><rect x="28" y="16" width="8" height="6" rx="3" fill="currentColor" stroke="none"/><path d="M16 28 C16 24 20 22 22 22 L42 22 C44 22 48 24 48 28" stroke-width="2.5"/><line x1="14" y1="28" x2="50" y2="28" stroke-width="2.5"/><path d="M14 28 L14 54 Q14 62 20 62 L44 62 Q50 62 50 54 L50 28"/><path d="M14 36 C10 36 8 38 8 42 C8 46 10 48 14 48" stroke-width="2"/><path d="M50 36 C54 36 56 38 56 42 C56 46 54 48 50 48" stroke-width="2"/></svg>'},
    {id:"serveret",da:"Serveret",en:"Served",
     icon:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="32" cy="56" rx="26" ry="6" stroke-width="2.5"/><path d="M8 56 C8 36 16 20 32 18 C48 20 56 36 56 56" stroke-width="2.5"/><path d="M14 46 C16 34 22 26 32 24 C42 26 48 34 50 46" stroke-width="1.2"/><circle cx="32" cy="10" r="5" fill="currentColor" stroke="none"/><line x1="32" y1="15" x2="32" y2="20" stroke-width="2.5"/></svg>'},
    {id:"andet",da:"Andet",en:"Other",
     icon:'<svg viewBox="0 0 64 64" fill="currentColor" stroke="none"><circle cx="32" cy="12" r="7"/><circle cx="32" cy="32" r="7"/><circle cx="32" cy="52" r="7"/></svg>'},
  ];
  function guessCategory(label){
    if(state.customCats&&state.customCats.length)return state.customCats[0].id;
    return "andet";
  }
  const DOTS_ICON=CATS.find(c=>c.id==="andet").icon;
  function allCats(){
    return [...CATS,...(state.customCats||[]).map(c=>({id:c.id,da:c.name,en:c.name,icon:c.icon||DOTS_ICON,custom:true,iconPending:c.iconPending}))];
  }

  const CATALOG=[
    {id:"preset_oyster",da:"Østers åbnet",en:"Oysters opened",cat:"aabnet-mad",icon:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 38c0-14 9-22 22-22s22 8 22 22"/><path d="M10 38c4 7 12 12 22 12s18-5 22-12"/><ellipse cx="32" cy="40" rx="10" ry="6" fill="currentColor" opacity=".18"/><path d="M32 20c-2 4-3 10-3 18"/></svg>'},
    {id:"preset_onion",da:"Løg snittet",en:"Onion sliced",cat:"snittet",icon:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><ellipse cx="32" cy="40" rx="18" ry="14"/><path d="M32 26c0-10 7-14 7-14s-5 4-7 14"/><path d="M20 34h24M18 40h28M20 46h24"/></svg>'},
    {id:"preset_bottle",da:"Flasker åbnet",en:"Bottles opened",cat:"aabnet-drikke",icon:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M27 12h10v8l5 8v20a3 3 0 01-3 3H25a3 3 0 01-3-3V28l5-8V12z"/><path d="M24 28h16"/><rect x="29" y="6" width="6" height="6" rx="1" fill="currentColor" opacity=".3" stroke="none"/><path d="M44 6l4-4"/></svg>'},
    {id:"preset_cover",da:"Couverter serveret",en:"Covers served",cat:"serveret",icon:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="32" cy="38" r="17"/><circle cx="32" cy="38" r="10" fill="currentColor" opacity=".12"/><path d="M16 12v8M19 12v4a3 3 0 01-6 0v-4"/><path d="M48 12c0 5-3 7-3 7v17"/></svg>'},
    {id:"preset_coffee_art",da:"Kaffe lavet",en:"Coffee made",cat:"tilberedt",icon:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 28h34l-4 22H18L14 28z"/><path d="M48 32h4a4 4 0 010 8h-4"/><ellipse cx="31" cy="28" rx="15" ry="4" fill="white" stroke="currentColor" stroke-width="1.5"/><path d="M31 24.5c-2.5-2-5.5-1.5-5.5 1s1.5 4 5.5 7c4-3 5.5-4.5 5.5-7s-3-3-5.5-1z" fill="currentColor" stroke="none" opacity=".62"/></svg>'},
    {id:"preset_guest",da:"Gæster modtaget",en:"Guests welcomed",cat:"serveret",icon:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="28" cy="18" r="8"/><path d="M12 52c0-10 7-16 16-16s16 6 16 16"/><path d="M46 20l6 4-6 4"/><path d="M46 24h-8"/></svg>'},
    {id:"preset_order",da:"Bestillinger taget",en:"Orders taken",cat:"serveret",icon:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="18" y="10" width="28" height="44" rx="3"/><path d="M24 22h16M24 30h16M24 38h10"/><path d="M36 42l3 3 6-7"/></svg>'},
    {id:"preset_starter",da:"Forret serveret",en:"Starter served",cat:"serveret",icon:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><ellipse cx="32" cy="42" rx="20" ry="6"/><path d="M12 42c0-14 9-20 20-20s20 6 20 20"/><path d="M22 34c2-4 5-6 10-6"/></svg>'},
    {id:"preset_main",da:"Hovedret serveret",en:"Main served",cat:"serveret",icon:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><ellipse cx="32" cy="46" rx="22" ry="5"/><path d="M10 46c0-16 10-26 22-26s22 10 22 26"/><path d="M32 20v-7"/><circle cx="32" cy="11" r="2.5" fill="currentColor"/></svg>'},
    {id:"preset_dessert",da:"Dessert serveret",en:"Dessert served",cat:"serveret",icon:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 48l10-30h16l10 30H14z"/><path d="M14 48h36"/><circle cx="32" cy="24" r="3" fill="currentColor" opacity=".4" stroke="none"/><path d="M24 40h16"/></svg>'},
    {id:"preset_bill",da:"Regning præsenteret",en:"Bill presented",cat:"serveret",icon:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="16" y="8" width="32" height="46" rx="2"/><path d="M16 54l8-6 8 6 8-6 8 6"/><path d="M22 20h20M22 28h20M22 36h12"/></svg>'},
    {id:"preset_tableset",da:"Borde dækket",en:"Tables set",cat:"serveret",icon:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="10" y="28" width="44" height="7" rx="2"/><path d="M16 35v16M48 35v16"/><circle cx="24" cy="20" r="5"/><circle cx="40" cy="20" r="5"/><path d="M24 15v-4M40 15v-4"/></svg>'},
    {id:"preset_tableclear",da:"Borde ryddet",en:"Tables cleared",cat:"serveret",icon:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="10" y="28" width="44" height="7" rx="2"/><path d="M16 35v16M48 35v16"/><path d="M24 13l14 14M38 13L24 27"/></svg>'},
    {id:"preset_wine_present",da:"Vin præsenteret",en:"Wine presented",cat:"serveret",icon:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 10h24l-6 20a8 8 0 01-16 0L20 10z"/><line x1="32" y1="34" x2="32" y2="50"/><line x1="22" y1="50" x2="42" y2="50"/><line x1="23" y1="22" x2="41" y2="22" opacity=".35"/></svg>'},
    {id:"preset_cocktail",da:"Cocktails mixet",en:"Cocktails mixed",cat:"tilberedt",icon:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 10h40L32 40v12"/><line x1="22" y1="50" x2="42" y2="50"/><circle cx="44" cy="17" r="4" fill="currentColor" opacity=".3" stroke="none"/><line x1="44" y1="10" x2="44" y2="22"/></svg>'},
    {id:"preset_coffee",da:"Kaffe serveret",en:"Coffee served",cat:"serveret",icon:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="14" y="28" width="30" height="24" rx="4"/><path d="M44 33h4a4 4 0 010 8h-4"/><path d="M22 16c0-4 3-6 3-10"/><path d="M31 16c0-4 3-6 3-10"/><line x1="10" y1="52" x2="54" y2="52"/></svg>'},
    {id:"preset_water",da:"Vand skænket",en:"Water poured",cat:"serveret",icon:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14h20a2 2 0 012 2v4H18v-4a2 2 0 012-2z"/><path d="M18 20h28l-4 30H22L18 20z"/><path d="M46 24l8-4"/><path d="M30 30c0 6-4 10-4 10s-4-4-4-10 4-8 4-8 4 2 4 8z" fill="currentColor" opacity=".2" stroke="none"/></svg>'},
    {id:"preset_champagne",da:"Champagne åbnet",en:"Champagne opened",cat:"aabnet-drikke",icon:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M28 12h8v6l5 8v22a3 3 0 01-3 3H26a3 3 0 01-3-3V26l5-8V12z"/><path d="M24 26h16"/><circle cx="44" cy="12" r="2.5" fill="currentColor" opacity=".5" stroke="none"/><circle cx="49" cy="18" r="2" fill="currentColor" opacity=".4" stroke="none"/><circle cx="43" cy="20" r="1.5" fill="currentColor" opacity=".35" stroke="none"/></svg>'},
    {id:"preset_wine_rec",da:"Vine anbefalet",en:"Wines recommended",cat:"serveret",icon:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M27 10h10v8l5 8v22a3 3 0 01-3 3H25a3 3 0 01-3-3V26l5-8V10z"/><path d="M24 26h16"/><path d="M32 33l2.5 5h5.5l-4 4 1.5 5.5L32 45l-5.5 2.5 1.5-5.5-4-4h5.5L32 33z" fill="currentColor" opacity=".35" stroke="none"/></svg>'},
    {id:"preset_allergy",da:"Allergier tjekket",en:"Allergies checked",cat:"serveret",icon:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M32 10l20 8v14c0 12-9 20-20 26C21 52 12 44 12 32V18l20-8z"/><path d="M22 32l8 8 12-14"/></svg>'},
    {id:"preset_amuse",da:"Amuse-bouche",en:"Amuse-bouche",cat:"serveret",icon:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><ellipse cx="32" cy="18" rx="11" ry="8"/><path d="M32 26v26"/><path d="M25 48c0 4 14 4 14 0"/></svg>'},
    {id:"preset_bread",da:"Brød serveret",en:"Bread served",cat:"serveret",icon:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 36c0-11 9-18 20-18s20 7 20 18v10H12V36z"/><path d="M12 46h40"/><path d="M20 30c2-4 6-6 12-6"/></svg>'},
    {id:"preset_choc",da:"Chokolader serveret",en:"Chocolates served",cat:"serveret",icon:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="12" y="26" width="40" height="26" rx="4"/><line x1="12" y1="38" x2="52" y2="38"/><line x1="29" y1="26" x2="29" y2="52"/><line x1="44" y1="26" x2="44" y2="52"/><path d="M20 20c0-4 3-6 3-10M32 20c0-4 3-6 3-10"/></svg>'},
    {id:"preset_welcome",da:"Velkomstdrink",en:"Welcome drink",cat:"serveret",icon:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 14h32l-4 36H20L16 14z"/><line x1="16" y1="26" x2="48" y2="26" opacity=".4"/><path d="M44 10l-12 14"/><circle cx="46" cy="8" r="3" fill="currentColor" opacity=".4" stroke="none"/></svg>'},
    {id:"preset_check",da:"Tjekliste",en:"Checklist",cat:"andet",icon:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="14" y="10" width="36" height="44" rx="4"/><path d="M22 22l4 4 8-8"/><path d="M22 34l4 4 8-8" opacity=".5"/><path d="M22 46h20" opacity=".2"/></svg>'},
    {id:"preset_meat",da:"Kød skåret",en:"Meat cut",cat:"snittet",icon:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M44 10H22a4 4 0 000 8h22v24a4 4 0 01-8 0V26H14V18h6"/><path d="M36 26v16"/></svg>'},
    {id:"preset_fish",da:"Fisk renset",en:"Fish cleaned",cat:"snittet",icon:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 32c6-14 18-18 30-10l10-10v20L40 22c-12 8-24 4-30 10z"/><path d="M10 32c6 14 18 18 30 10"/><circle cx="28" cy="28" r="2.5" fill="currentColor"/></svg>'},
    {id:"preset_plate",da:"Portioner anrettet",en:"Portions plated",cat:"tilberedt",icon:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="20" cy="36" r="13"/><circle cx="44" cy="36" r="13"/><circle cx="20" cy="36" r="7" fill="currentColor" opacity=".12"/><circle cx="44" cy="36" r="7" fill="currentColor" opacity=".12"/></svg>'},
    {id:"preset_sauce",da:"Saucer lavet",en:"Sauces made",cat:"tilberedt",icon:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 28h36v12a6 6 0 01-6 6H20a6 6 0 01-6-6V28z"/><path d="M50 32h6a2 2 0 010 5h-6"/><path d="M20 16c0-3 3-5 3-8M32 16c0-3 3-5 3-8"/></svg>'},
    {id:"preset_mise",da:"Mise en place",en:"Mise en place",cat:"tilberedt",icon:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="10" y="38" width="44" height="16" rx="3"/><path d="M50 14L28 36"/><path d="M50 14c3-3 3-7 0-9s-7-2-9 0l-5 9 5 5 9-5z"/><line x1="24" y1="44" x2="24" y2="48"/><line x1="32" y1="44" x2="32" y2="48"/><line x1="40" y1="44" x2="40" y2="48"/></svg>'},
    {id:"preset_snaps",da:"Snaps serveret",en:"Snaps served",cat:"serveret",icon:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 18h20l-4 32H26L22 18z"/><line x1="20" y1="18" x2="44" y2="18" stroke-width="3"/><line x1="22" y1="28" x2="42" y2="28" opacity=".35"/></svg>'},
    {id:"preset_cheese",da:"Oste serveret",en:"Cheese served",cat:"serveret",icon:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 46l24-30 24 12v18H8z"/><circle cx="28" cy="38" r="3.5" fill="currentColor" opacity=".35" stroke="none"/><circle cx="40" cy="32" r="2.5" fill="currentColor" opacity=".35" stroke="none"/><circle cx="20" cy="42" r="2" fill="currentColor" opacity=".35" stroke="none"/></svg>'},
    {id:"preset_temp",da:"Temperatur tjekket",en:"Temperature checked",cat:"andet",icon:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="28" y="10" width="8" height="30" rx="4"/><circle cx="32" cy="46" r="8"/><line x1="32" y1="34" x2="32" y2="40" stroke-width="3" opacity=".5"/><line x1="36" y1="18" x2="42" y2="18" opacity=".5"/><line x1="36" y1="24" x2="40" y2="24" opacity=".4"/></svg>'},
  ];

  const CAT_BY_LABEL={};CATALOG.forEach(p=>{CAT_BY_LABEL[p.da.toLowerCase()]=p.cat;CAT_BY_LABEL[p.en.toLowerCase()]=p.cat;});
  const _LBL_DA2EN={},_LBL_EN2DA={};
  CATALOG.forEach(p=>{_LBL_DA2EN[p.da.toLowerCase()]=p.en;_LBL_EN2DA[p.en.toLowerCase()]=p.da;});
  Object.keys(LABEL_TRANSLATIONS).forEach(da=>{const en=LABEL_TRANSLATIONS[da].en;if(en){_LBL_DA2EN[da.toLowerCase()]=en;_LBL_EN2DA[en.toLowerCase()]=da;}});
  function registerLabelPair(da,en){
    if(!da||!en||da.toLowerCase()===en.toLowerCase())return;
    _LBL_DA2EN[da.toLowerCase()]=en;_LBL_EN2DA[en.toLowerCase()]=da;
    if(!state.labelI18n)state.labelI18n={};
    state.labelI18n[da]=en;
  }
  // Nye bruger-navngivne tællere får den anden sprogversion genereret af AI i baggrunden
  async function requestLabelTranslation(label){
    if(!label)return;
    const k=label.toLowerCase();
    if(_LBL_DA2EN[k]||_LBL_EN2DA[k])return;
    const base=apiBase();const token=await getToken();if(!base||!token)return;
    try{
      const r=await fetch(base+"/api/translate-label",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({label})});
      if(!r.ok)return;
      const d=await r.json();
      if(d&&d.da&&d.en){registerLabelPair(d.da,d.en);save();}
    }catch(e){}
  }

  const OYSTER_TYPES=["Gillardeau","Fine de Claire","Spéciale de Claire","Marennes-Oléron","Belon","Tsarskaya","Limfjordsøsters","Kumamoto","Blue Point","Utah Beach","Pied de Cheval"];
  const LANDE=["Frankrig","Italien","Spanien","Tyskland","Portugal","Østrig","USA","Argentina","Chile","Australien","New Zealand","Sydafrika","Danmark","Ungarn","Grækenland","Libanon","Georgien"];
  const OMRAADER=["Bourgogne","Bordeaux","Champagne","Rhône","Loire","Alsace","Beaujolais","Jura","Languedoc","Provence","Toscana","Piemonte","Veneto","Lombardiet","Sicilien","Rioja","Ribera del Duero","Priorat","Rías Baixas","Mosel","Rheingau","Pfalz","Nahe","Douro","Dão","Wachau","Napa Valley","Sonoma","Willamette Valley","Barossa Valley","Marlborough","Mendoza","Stellenbosch"];
  const DRUER=["Pinot Noir","Chardonnay","Cabernet Sauvignon","Merlot","Syrah","Shiraz","Sangiovese","Nebbiolo","Tempranillo","Garnacha","Grenache","Gamay","Riesling","Sauvignon Blanc","Chenin Blanc","Pinot Grigio","Pinot Gris","Gewürztraminer","Viognier","Mourvèdre","Barbera","Dolcetto","Malbec","Cabernet Franc","Carignan","Nerello Mascalese","Corvina","Verdejo","Albarïo","Grüner Veltliner","Touriga Nacional","Furmint","Assyrtiko"];
  const LOEG_TYPER=["Gul løg","Rødløg","Skalotteløg","Forårsløg","Perleløg","Spanske løg","Bananskalotte","Porre"];
  const VIN_TYPER=["Konventionel vin","Naturvin"];

  function id(){return Math.random().toString(36).slice(2,10);}
  function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));}
  function clone(o){return JSON.parse(JSON.stringify(o));}
  function seedFor(label){const l=(label||"").toLowerCase();if(/østers|oyster/.test(l))return OYSTER_TYPES.slice();if(/løg/.test(l))return LOEG_TYPER.slice();if(/vin|flaske/.test(l))return VIN_TYPER.slice();return [];}

  const DEFAULTS={counters:[],wines:[],log:[],shiftHistory:[],labelI18n:{}};

  let state={counters:[],wines:[],log:[],customCats:[]},mem=null,wineFilter="";
  let activeWineType=localStorage.getItem("mise_wine_type")||"alle";
  // Pro-rettighed (Vin, The Lab og alle AI-features). Sættes fra /api/user/profile.
  let _isPro=false;
  // Håndhæves gating overhovedet? Spejler serverens PRO_ENFORCE (fra /api/config).
  // Slukket = appen er HELT åben (test/beta) — gating er inert uanset _isPro.
  let _proEnforced=false;
  // Restauranter (verificerede hold) — spejler serverens RESTAURANTS_ENABLED.
  let _restaurantsEnabled=false;

  const WINE_FLAGS={"Frankrig":"🇫🇷","France":"🇫🇷","Italien":"🇮🇹","Italy":"🇮🇹","Spanien":"🇪🇸","Spain":"🇪🇸","Portugal":"🇵🇹","Tyskland":"🇩🇪","Germany":"🇩🇪","Østrig":"🇦🇹","Austria":"🇦🇹","USA":"🇺🇸","Australien":"🇦🇺","Australia":"🇦🇺","New Zealand":"🇳🇿","Sydafrika":"🇿🇦","South Africa":"🇿🇦","Chile":"🇨🇱","Argentina":"🇦🇷","Grækenland":"🇬🇷","Greece":"🇬🇷","Ungarn":"🇭🇺","Hungary":"🇭🇺","Georgien":"🇬🇪","Georgia":"🇬🇪","Libanon":"🇱🇧","Lebanon":"🇱🇧","Danmark":"🇩🇰","Denmark":"🇩🇰","Slovenien":"🇸🇮","Kroatien":"🇭🇷"};
  const REGION_TO_LAND={"toscana":"Italien","tuscany":"Italien","piemonte":"Italien","piedmont":"Italien","veneto":"Italien","sicilia":"Italien","sicily":"Italien","lombardia":"Italien","lombardy":"Italien","emilia-romagna":"Italien","emilia romagna":"Italien","friuli":"Italien","puglia":"Italien","campania":"Italien","abruzzo":"Italien","umbria":"Italien","lazio":"Italien","marche":"Italien","brunello":"Italien","chianti":"Italien","barolo":"Italien","amarone":"Italien","bordeaux":"Frankrig","bourgogne":"Frankrig","burgundy":"Frankrig","champagne":"Frankrig","alsace":"Frankrig","loire":"Frankrig","rhône":"Frankrig","rhone":"Frankrig","provence":"Frankrig","languedoc":"Frankrig","roussillon":"Frankrig","côtes du rhône":"Frankrig","cotes du rhone":"Frankrig","médoc":"Frankrig","medoc":"Frankrig","saint-émilion":"Frankrig","pomerol":"Frankrig","rioja":"Spanien","ribera del duero":"Spanien","priorat":"Spanien","penedès":"Spanien","penedes":"Spanien","rias baixas":"Spanien","catalonia":"Spanien","catalunya":"Spanien","rueda":"Spanien","jumilla":"Spanien","douro":"Portugal","alentejo":"Portugal","vinho verde":"Portugal","dão":"Portugal","dao":"Portugal","setúbal":"Portugal","setubal":"Portugal","mosel":"Tyskland","rheingau":"Tyskland","pfalz":"Tyskland","nahe":"Tyskland","rheinhessen":"Tyskland","franken":"Tyskland","wachau":"Østrig","kamptal":"Østrig","burgenland":"Østrig","steiermark":"Østrig","napa valley":"USA","napa":"USA","sonoma":"USA","willamette valley":"USA","columbia valley":"USA","barossa valley":"Australien","barossa":"Australien","yarra valley":"Australien","mclaren vale":"Australien","coonawarra":"Australien","margaret river":"Australien","marlborough":"New Zealand","central otago":"New Zealand","hawke's bay":"New Zealand","stellenbosch":"Sydafrika","swartland":"Sydafrika","constantia":"Sydafrika","mendoza":"Argentina","patagonia":"Argentina","salta":"Argentina","maipo":"Chile","colchagua":"Chile","casablanca":"Chile","aconcagua":"Chile","nemea":"Grækenland","naoussa":"Grækenland","tokaj":"Ungarn","eger":"Ungarn","kakheti":"Georgien","bekaa valley":"Libanon"};
  function wLand(w){const l=(w.land||"").trim();return REGION_TO_LAND[l.toLowerCase()]||l;}

  function guessWineType(wine){
    const g=(wine.grape||"").toLowerCase();
    const n=(wine.name||"").toLowerCase();
    const r=(wine.region||"").toLowerCase();
    const all=g+" "+n+" "+r;
    const sparkling=["champagne","cava","prosecco","cremant","crémant","sekt","petillant","pétillant","pet-nat","mousserende","spumante","franciacorta","lambrusco","blanquette"];
    if(sparkling.some(s=>all.includes(s)))return"mousserende";
    const white=["chardonnay","sauvignon blanc","sauvignon","riesling","pinot gris","pinot grigio","viognier","gewürz","gewurz","chenin blanc","chenin","muscat","moscato","verdejo","albarino","albariño","grüner","gruner","silvaner","trebbiano","greco","fiano","vermentino","godello","roussanne","marsanne","picpoul","furmint","torrontes","torrontés","assyrtiko","arneis"];
    if(white.some(s=>g.includes(s)))return"hvid";
    const red=["cabernet","merlot","pinot noir","syrah","shiraz","grenache","tempranillo","sangiovese","nebbiolo","barbera","dolcetto","montepulciano","primitivo","zinfandel","malbec","carmenere","mourvèdre","mourvedre","corvina","touriga","garnacha","monastrell","nero d","aglianico","gamay","carignan","nerello","corvina"];
    if(red.some(s=>g.includes(s)))return"rod";
    return"andet";
  }

  const logHistory=[];

  // ---- Auth ----
  let session=(()=>{try{return JSON.parse(localStorage.getItem("mise_session")||"null");}catch(e){return null;}})();
  let cfg={supabaseUrl:"",anonKey:""};
  let authMode="login";

  function saveSession(data){
    session={access_token:data.access_token,refresh_token:data.refresh_token,expires_at:Date.now()+data.expires_in*1000};
    localStorage.setItem("mise_session",JSON.stringify(session));
  }

  async function supabaseAuth(path,body){
    if(!cfg.supabaseUrl)throw new Error("config_not_loaded");
    const res=await fetch(cfg.supabaseUrl+"/auth/v1/"+path,{method:"POST",headers:{"Content-Type":"application/json","apikey":cfg.anonKey},body:JSON.stringify(body)});
    try{return await res.json();}catch(e){throw new Error("server_error_"+res.status);}
  }

  async function signIn(email,password){
    const data=await supabaseAuth("token?grant_type=password",{email,password});
    if(data.access_token){saveSession(data);return null;}
    return data.error_description||data.msg||data.message||"Forkert email eller adgangskode";
  }

  async function signUp(email,password){
    const data=await supabaseAuth("signup",{email,password});
    if(data.access_token){saveSession(data);return null;}
    if(data.id&&!data.access_token)return{info:lang==="da"?"Vi har sendt en bekræftelsesmail til "+email+". Klik på linket i mailen og log derefter ind her.":"We've sent a confirmation email to "+email+". Click the link in the email, then log in here."};
    return data.error_description||data.msg||data.message||"Fejl ved oprettelse";
  }

  async function refreshSession(){
    if(!session||!session.refresh_token)return false;
    try{
      const data=await supabaseAuth("token?grant_type=refresh_token",{refresh_token:session.refresh_token});
      if(data.access_token){saveSession(data);return true;}
      session=null;localStorage.removeItem("mise_session");return false;
    }catch(e){return false;}
  }

  async function getToken(){
    if(!session)return null;
    if(Date.now()>session.expires_at-60000){const ok=await refreshSession();if(!ok)return null;}
    return session.access_token;
  }

  function showAuthScreen(){
    $("#authScreen").style.display="flex";
    $("#mainWrap").style.display="none";
    {const _so2=$("#signOutBtn");if(_so2)_so2.style.display="none";}
    const shiftStartBtn=$("#shiftStartBtn");if(shiftStartBtn)shiftStartBtn.style.display="none";
    const splash=$("#authSplash"),form=$("#authFormWrap");
    if(splash)splash.style.display="";if(form)form.style.display="none";
    const suScrim=$("#signupSetupScrim");if(suScrim)suScrim.classList.remove("open");
    authMode="login";
    const errEl=$("#authErr"),infoEl=$("#authInfo");
    if(errEl)errEl.style.display="none";if(infoEl)infoEl.style.display="none";
  }

  function hideAuthScreen(){
    $("#authScreen").style.display="none";
    $("#mainWrap").style.display="";
    {const _so3=$("#signOutBtn");if(_so3)_so3.style.display="";}
    const pb=$("#profileBtn");if(pb)pb.style.display="";
  }

  function oauthSignIn(provider){
    if(!cfg||!cfg.supabaseUrl){showToast(t("auth_oauth_err"));return;}
    track("oauth_start",{p:provider});
    const redirectTo=location.origin+location.pathname;
    location.href=cfg.supabaseUrl+"/auth/v1/authorize?provider="+provider+"&redirect_to="+encodeURIComponent(redirectTo);
  }
  function _consumeOAuthHash(){
    if(!location.hash||location.hash.indexOf("access_token=")<0)return false;
    try{
      const params=new URLSearchParams(location.hash.slice(1));
      const access_token=params.get("access_token"),refresh_token=params.get("refresh_token"),expires_in=parseInt(params.get("expires_in"),10)||3600;
      if(access_token){
        saveSession({access_token,refresh_token,expires_in});
        history.replaceState(null,"",location.pathname+location.search);
        return true;
      }
    }catch(e){}
    return false;
  }
  function fetchWithTimeout(url,opts,ms){
    const ctl=new AbortController();
    const t=setTimeout(()=>ctl.abort(),ms);
    return fetch(url,{...opts,signal:ctl.signal}).finally(()=>clearTimeout(t));
  }
  // Henter /api/config robust — flere forsøg + længere timeout, så en langsom
  // server-koldstart (Railway) ikke efterlader cfg tom og smider os ud af login.
  async function loadConfig(tries){
    for(let i=0;i<(tries||3);i++){
      try{const res=await fetchWithTimeout(apiBase()+"/api/config",{},8000);const j=await res.json();if(j&&j.supabaseUrl){cfg=j;_proEnforced=!!j.proEnforced;_restaurantsEnabled=!!j.restaurantsEnabled;return true;}}
      catch(e){console.warn("CT:config try"+i,e.message);}
      await new Promise(r=>setTimeout(r,600));
    }
    return false;
  }
  async function initAuth(){
    await loadConfig(3);
    if(!session){showAuthScreen();return false;}
    if(Date.now()>session.expires_at-60000){
      const ok=await refreshSession();
      // refreshSession rydder KUN session når refresh-token reelt er ugyldigt.
      // Fejler den forbigående (netværk/koldstart) beholder vi login og bruger
      // cached data — vi må ALDRIG smide en logget-ind bruger ud på en hikke.
      if(!ok&&!session){showAuthScreen();return false;}
      if(!ok)console.warn("CT:refresh udskudt (forbigående) — beholder session");
    }
    try{const _pr=await fetchWithTimeout(apiBase()+"/api/user/profile",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+session.access_token}},6000);const _pd=await _pr.json();_isPro=!!_pd.pro;}catch(e){console.warn("CT:profile fail",e.message);}
    hideAuthScreen();return true;
  }

  function setupAuthForm(){
    const emailEl=$("#authEmail"),pwEl=$("#authPw"),submitBtn=$("#authSubmit"),errEl=$("#authErr"),toggleLink=$("#authToggleLink"),forgotLink=$("#authForgot");
    function updateMode(){
      const isLogin=authMode==="login";
      const h1=$("#authH1");if(h1)h1.textContent=isLogin?t("auth_h1_login"):t("auth_h1_signup");
      $("#authSub").textContent=isLogin?t("auth_sub_login"):t("auth_sub_signup");
      submitBtn.textContent=isLogin?t("auth_login"):t("auth_signup");
      $("#authToggleText").textContent=isLogin?t("auth_no_account"):t("auth_have_account");
      toggleLink.textContent=isLogin?t("auth_create"):t("auth_to_login");
      pwEl.autocomplete=isLogin?"current-password":"new-password";
      errEl.style.display="none";$("#authInfo").style.display="none";
      if(forgotLink)forgotLink.style.display=isLogin?"inline":"none";
      if(forgotLink)forgotLink.textContent=t("auth_forgot");
    }
    function showForm(mode){
      authMode=mode;updateMode();
      const splash=$("#authSplash"),form=$("#authFormWrap");
      if(splash)splash.style.display="none";if(form)form.style.display="";
      setTimeout(()=>emailEl.focus(),260);
    }
    const getStartedBtn=$("#authGetStarted");if(getStartedBtn)getStartedBtn.addEventListener("click",()=>{track("auth_get_started");showForm("signup");});
    const goLoginBtn=$("#authGoLogin");if(goLoginBtn)goLoginBtn.addEventListener("click",()=>showForm("login"));
    const backBtn=$("#authBackBtn");if(backBtn)backBtn.addEventListener("click",()=>{
      const splash=$("#authSplash"),form=$("#authFormWrap");
      if(form)form.style.display="none";if(splash)splash.style.display="";
    });
    const gBtn=$("#authGoogleBtn");if(gBtn)gBtn.addEventListener("click",()=>oauthSignIn("google"));
    const aBtn=$("#authAppleBtn");if(aBtn)aBtn.addEventListener("click",()=>oauthSignIn("apple"));
    if(forgotLink)forgotLink.addEventListener("click",async(e)=>{
      e.preventDefault();
      const email=emailEl.value.trim();
      if(!email){errEl.textContent=lang==="da"?"Indtast din email først":"Enter your email first";errEl.style.display="block";return;}
      forgotLink.style.pointerEvents="none";forgotLink.style.opacity=".5";
      try{await supabaseAuth("recover",{email,redirectTo:window.location.origin});}catch(e){}
      forgotLink.style.pointerEvents="";forgotLink.style.opacity="";
      const infoEl=$("#authInfo");if(infoEl){infoEl.textContent=t("auth_forgot_sent");infoEl.style.display="block";}
      if(errEl)errEl.style.display="none";
    });
    toggleLink.addEventListener("click",()=>{authMode=authMode==="login"?"signup":"login";updateMode();});
    submitBtn.addEventListener("click",async()=>{
      const email=emailEl.value.trim(),pw=pwEl.value;if(!email||!pw)return;
      submitBtn.disabled=true;submitBtn.textContent="…";
      let result;
      try{result=authMode==="login"?await signIn(email,pw):await signUp(email,pw);}
      catch(e){result=e.message==="config_not_loaded"?(lang==="da"?"Server utilgængelig, prøv igen":"Server unavailable, try again"):e.message||"Netværksfejl";}
      submitBtn.disabled=false;updateMode();
      if(result&&result.info){
        $("#authInfo").textContent=result.info;$("#authInfo").style.display="block";
        $("#authErr").style.display="none";
        emailEl.value="";pwEl.value="";
        authMode="login";updateMode();
        return;
      }
      if(result){$("#authErr").textContent=result;$("#authErr").style.display="block";return;}
      try{await fetch(apiBase()+"/api/user/profile",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+session.access_token}});}catch(e){}
      if(authMode==="signup"){maybeShowSignupSetup(null,"presignup");return;}
      hideAuthScreen();startApp();
    });
    [emailEl,pwEl].forEach(el=>el.addEventListener("keydown",e=>{if(e.key==="Enter")submitBtn.click();}));
    {const _so4=$("#signOutBtn");if(_so4)_so4.addEventListener("click",()=>{session=null;localStorage.removeItem("mise_session");localStorage.removeItem(STORE_KEY);localStorage.removeItem("mise_shift");localStorage.removeItem("mise_state_owner");state=clone(DEFAULTS);showAuthScreen();});}
    updateMode();
  }

  const SYNC_Q_KEY="mise_sync_q";
  function getSyncQ(){try{return JSON.parse(localStorage.getItem(SYNC_Q_KEY)||"[]");}catch(e){return [];}}
  function saveSyncQ(q){localStorage.setItem(SYNC_Q_KEY,JSON.stringify(q));}
  function updateOfflineDot(){const dot=$("#offlineDot");if(!dot)return;const q=getSyncQ();dot.classList.toggle("show",q.length>0);dot.title=q.length?t("offline_pending",q.length):"";}
  async function flushSyncQ(){
    if(!navigator.onLine)return;
    const q=getSyncQ();if(!q.length)return;
    saveSyncQ([]);
    const failed=[];
    for(const item of q){const ok=await syncLogEntry(item.categoryLabel,item.delta,item.imageUrl,true,item.summary);if(!ok)failed.push(item);}
    if(failed.length)saveSyncQ([...failed,...getSyncQ()]);
    updateOfflineDot();
  }
  window.addEventListener("online",()=>flushSyncQ());
  async function syncLogEntry(categoryLabel,delta,imageUrl,fromQueue,summary){
    const base=apiBase();if(!base)return false;
    if(!navigator.onLine&&!fromQueue){const q=getSyncQ();q.push({categoryLabel,delta,imageUrl:imageUrl||null,summary:summary||null});saveSyncQ(q);updateOfflineDot();return false;}
    const token=await getToken();if(!token)return false;
    // Rå-logs er private — de tæller i stats/rangliste men oversvømmer ikke feedet.
    // Kun vagt-recap (postShift) + eksplicit delte opslag er offentlige.
    const body={categoryLabel,delta,isPublic:false};if(imageUrl)body.imageUrl=imageUrl;if(summary)body.summary=summary;
    try{await fetch(base+"/api/log-entry",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify(body)});return true;}
    catch(e){if(!fromQueue){const q=getSyncQ();q.push({categoryLabel,delta,imageUrl:imageUrl||null,summary:summary||null});saveSyncQ(q);updateOfflineDot();}return false;}
  }

  async function load(){try{const v=localStorage.getItem(STORE_KEY);if(v)return normalize(JSON.parse(v));}catch(e){}return clone(DEFAULTS);}
  async function save(){try{state._updatedAt=Date.now();localStorage.setItem(STORE_KEY,JSON.stringify(state));}catch(e){console.error(e);}schedulePushState();}
  // ── Server-backup af state (punkt: localStorage er ikke en database) ──
  let _pushTimer=null;
  function schedulePushState(){if(!session)return;clearTimeout(_pushTimer);_pushTimer=setTimeout(pushState,4000);}
  let _lastPushHash="";
  function _stateHash(){const c={...state};delete c._updatedAt;return JSON.stringify(c);}
  async function pushState(){
    if(_pushTimer){clearTimeout(_pushTimer);_pushTimer=null;}
    const h=_stateHash();
    if(h===_lastPushHash)return;
    const base=apiBase();const token=await getToken();if(!base||!token)return;
    try{
      const r=await fetch(base+"/api/state",{method:"POST",keepalive:true,headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({data:state})});
      if(r.ok)_lastPushHash=h;
    }catch(e){}
  }
  // Union-merge pr. element: to enheder kan logge hver for sig uden at
  // overskrive hinandens aften. Tie/uden-timestamp → lokal vinder.
  function _mergeById(localArr,remoteArr,score){
    const map=new Map();
    (remoteArr||[]).forEach(x=>{if(x&&x.id)map.set(x.id,x);});
    (localArr||[]).forEach(x=>{
      if(!x||!x.id)return;
      const r=map.get(x.id);
      if(!r||score(x)>=score(r))map.set(x.id,x);
    });
    return [...map.values()];
  }
  function mergeStates(local,remote){
    const m={};
    // Tællere: højeste total vinder (counts går praktisk talt aldrig ned)
    m.counters=_mergeById(local.counters,remote.counters,c=>counterTotal(c));
    m.wines=_mergeById(local.wines,remote.wines,w=>(w.glasses||0)+(w.bottles||0));
    m.shiftHistory=_mergeById(local.shiftHistory,remote.shiftHistory,x=>new Date(x.endedAt||x.startedAt||0).getTime()||0)
      .sort((a,b)=>new Date(b.startedAt)-new Date(a.startedAt)).slice(0,365);
    const logKey=e=>e.ts+"|"+(e.text||"");
    const logMap=new Map();
    [...(remote.log||[]),...(local.log||[])].forEach(e=>{if(e&&e.ts)logMap.set(logKey(e),e);});
    m.log=[...logMap.values()].sort((a,b)=>b.ts-a.ts).slice(0,2000);
    m.customCats=_mergeById(local.customCats,remote.customCats,()=>1);
    m.labelI18n=Object.assign({},remote.labelI18n||{},local.labelI18n||{});
    m._updatedAt=Math.max(local._updatedAt||0,remote._updatedAt||0);
    return normalize(m);
  }
  async function pullState(){
    const base=apiBase();const token=await getToken();if(!base||!token)return;
    try{
      const r=await fetchWithTimeout(base+"/api/state",{headers:{"Authorization":"Bearer "+token}},5000);
      if(!r.ok)return;
      const d=await r.json();
      if(!d||!d.data){if(state._updatedAt)pushState();return;}
      const localTs=state._updatedAt||0;
      state=localTs?mergeStates(state,normalize(d.data)):normalize(d.data);
      localStorage.setItem(STORE_KEY,JSON.stringify(state));
      pushState();
    }catch(e){}
  }
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden"){if(_pushTimer)pushState();flushDeferredSync();flushEvents();}});

  // ── Produktanalytik: anonyme feature-events, batched ──
  let _evQueue=[],_evTimer=null;
  function track(e,m){
    _evQueue.push({e,m:m||undefined});
    if(_evQueue.length>=20)flushEvents();
    else if(!_evTimer)_evTimer=setTimeout(flushEvents,30000);
  }
  async function flushEvents(){
    if(_evTimer){clearTimeout(_evTimer);_evTimer=null;}
    if(!_evQueue.length)return;
    const batch=_evQueue.splice(0,40);
    const base=apiBase();const token=await getToken();if(!base||!token)return;
    try{fetch(base+"/api/events",{method:"POST",keepalive:true,headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({events:batch})}).catch(()=>{});}catch(e){}
  }

  // ── Push: abonnér når tilladelsen er givet ──
  function _vapidToKey(b64){
    const pad="=".repeat((4-b64.length%4)%4);
    const raw=atob((b64+pad).replace(/-/g,"+").replace(/_/g,"/"));
    return Uint8Array.from([...raw].map(c=>c.charCodeAt(0)));
  }
  async function ensurePushSubscription(){
    try{
      if(!("Notification" in window)||Notification.permission!=="granted")return;
      if(!cfg||!cfg.vapidKey||!("serviceWorker" in navigator))return;
      const reg=await navigator.serviceWorker.ready;
      let sub=await reg.pushManager.getSubscription();
      if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:_vapidToKey(cfg.vapidKey)});
      const base=apiBase();const token=await getToken();if(!base||!token)return;
      const j=sub.toJSON();
      await fetch(base+"/api/push/subscribe",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({endpoint:j.endpoint,keys:j.keys})});
    }catch(e){}
  }
  function normalize(s){
    s.counters=(s.counters||[]).map(c=>({id:c.id||id(),label:c.label||"",count:c.count||0,unit:c.unit||"stk",cat:(c.cat&&c.cat!=="andet")?c.cat:(CAT_BY_LABEL[(c.label||"").toLowerCase()]||c.cat||"andet"),subs:Array.isArray(c.subs)?c.subs.map(x=>({id:x.id||id(),name:x.name||"",count:x.count||0})):[],suggest:(Array.isArray(c.suggest)&&c.suggest.length)?c.suggest:seedFor(c.label)}));
    s.wines=(s.wines||[]).map(w=>({id:w.id||id(),name:w.name||"",producer:w.producer||"",land:w.land||"",region:w.region||"",grape:w.grape||"",vint:w.vint||"",glasses:w.glasses||0,bottles:w.bottles||0,opened:w.opened||0,type:w.type||"andet",imageUrl:w.imageUrl||null,about:w.about||"",fromLineup:w.fromLineup||false}));
    s.log=Array.isArray(s.log)?s.log.filter(e=>e&&e.ts&&e.text):[];
    s.customCats=Array.isArray(s.customCats)?s.customCats.map(c=>({id:c.id||id(),name:c.name||"",icon:c.icon||"",iconPending:!!c.iconPending})):[];
    s.shiftHistory=Array.isArray(s.shiftHistory)?s.shiftHistory:[];
    s.labelI18n=(s.labelI18n&&typeof s.labelI18n==="object"&&!Array.isArray(s.labelI18n))?s.labelI18n:{};
    Object.keys(s.labelI18n).forEach(da=>{const en=s.labelI18n[da];if(en){_LBL_DA2EN[da.toLowerCase()]=en;_LBL_EN2DA[en.toLowerCase()]=da;}});
    s.resume=_normResume(s.resume);
    return s;
  }
  function _normResume(r){
    r=(r&&typeof r==="object")?r:{};
    return {
      name:r.name||"", title:r.title||"", location:r.location||"",
      email:r.email||"", phone:r.phone||"", bio:r.bio||"", photo:r.photo||"",
      specialties:Array.isArray(r.specialties)?r.specialties.filter(x=>x):[],
      work:Array.isArray(r.work)?r.work.map(w=>({id:w.id||id(),place:w.place||"",role:w.role||"",start:w.start||"",end:w.end||""})):[]
    };
  }
  function counterTotal(c){return c.subs.length?c.subs.reduce((a,b)=>a+b.count,0):c.count;}
  function fmtNum(n){return Math.round(n).toLocaleString(lang==="da"?"da-DK":"en-GB");}
  function readNum(el){if(!el)return 0;if(el.dataset&&el.dataset.raw!==undefined)return +el.dataset.raw||0;return parseInt(String(el.textContent).replace(/[^\d-]/g,""),10)||0;}
  function fmtCount(val,unit){
    if(!unit||unit==="stk")return fmtNum(val);
    const n=Math.round(val*10)/10;
    return Number.isInteger(n)?n+",0":String(n).replace(".",",");
  }
  function career(){let t=0;state.counters.forEach(c=>t+=counterTotal(c));state.wines.forEach(w=>t+=(w.glasses||0)+(w.bottles||0));return t;}
  function renderCareer(){$("#careerNum").textContent=fmtNum(career());renderStreak();}

  // ---- numtray ----
  let numtrayCallback=null;
  const numtray=$("#numtray");
  const numtrayInput=$("#numtrayInput");
  function syncNumtrayToViewport(){
    if(!numtray.classList.contains("open"))return;
    const vv=window.visualViewport;
    if(!vv)return;
    // For position:fixed elements, offsetTop is irrelevant — only height delta matters
    const keyboardH=Math.max(0,window.innerHeight-vv.height);
    numtray.style.bottom=keyboardH+"px";
  }
  if(window.visualViewport){
    window.visualViewport.addEventListener("resize",syncNumtrayToViewport);
  }
  numtrayInput.addEventListener("focus",()=>{
    // Retry at multiple points — keyboard animation takes ~300ms on iOS
    setTimeout(syncNumtrayToViewport,100);
    setTimeout(syncNumtrayToViewport,300);
    setTimeout(syncNumtrayToViewport,500);
  });
  function openNumtray(label,initialVal,onSave){
    $("#numtrayLabel").textContent=label;numtrayInput.value=initialVal!==""?initialVal:"";
    numtrayCallback=onSave;numtray.classList.add("open");
    setTimeout(()=>{numtrayInput.select();numtrayInput.focus();},60);
  }
  function closeNumtray(){numtray.classList.remove("open");numtray.style.bottom="";numtrayCallback=null;}
  $("#numtrayOk").addEventListener("click",()=>{const val=parseInt(numtrayInput.value,10);if(!isNaN(val)&&numtrayCallback)numtrayCallback(val);closeNumtray();});
  $("#numtrayCancel").addEventListener("click",closeNumtray);
  numtrayInput.addEventListener("keydown",e=>{if(e.key==="Enter")$("#numtrayOk").click();if(e.key==="Escape")closeNumtray();});

  // ---- photo ----
  let pendingPhotoDataUrl=null;
  // Afspejler det ventende foto i BÅDE den gamle inline-thumb OG '+'-overlayens
  // thumb/kamera-ikon, så knappen lyser når et billede er vedhæftet.
  function reflectPendingPhoto(){
    const has=!!pendingPhotoDataUrl;
    const th=$("#photoThumb");if(th){th.src=has?pendingPhotoDataUrl:"";th.style.display=has?"block":"none";}
    const cam=$("#photoBtn");if(cam)cam.style.color=has?"var(--accent)":"";
    const ovth=$("#qlogOvThumb");if(ovth){ovth.src=has?pendingPhotoDataUrl:"";ovth.classList.toggle("show",has);}
    const ovcam=$("#qlogOvCam");if(ovcam)ovcam.style.color=has?"var(--accent)":"";
  }
  function clearPendingPhoto(){pendingPhotoDataUrl=null;const pi=$("#photoInput");if(pi)pi.value="";reflectPendingPhoto();}
  function setupPhoto(){
    const photoInput=$("#photoInput");if(!photoInput)return;
    const camBtn=$("#photoBtn");if(camBtn)camBtn.addEventListener("click",()=>photoInput.click());
    const ovCam=$("#qlogOvCam");if(ovCam)ovCam.addEventListener("click",()=>photoInput.click());
    photoInput.addEventListener("change",async()=>{
      const file=photoInput.files[0];if(!file)return;
      const allowed=["image/jpeg","image/png","image/webp","image/heic","image/heif"];
      if(!allowed.includes(file.type)&&!file.type.startsWith("image/")){showToast(t("img_only"));photoInput.value="";return;}
      if(file.size>20*1024*1024){showToast(lang==="da"?"Billedet er for stort (maks 20 MB)":"Image too large (max 20 MB)");photoInput.value="";return;}
      const url=await resizeImage(file,1200);
      pendingPhotoDataUrl=url;
      reflectPendingPhoto();
    });
    const th=$("#photoThumb");if(th)th.addEventListener("click",clearPendingPhoto);
    const ovth=$("#qlogOvThumb");if(ovth)ovth.addEventListener("click",clearPendingPhoto);
  }
  function resizeImage(file,maxPx){
    return new Promise(resolve=>{
      const reader=new FileReader();
      reader.onerror=()=>resolve(null);
      reader.onload=ev=>{
        const img=new Image();
        img.onerror=()=>resolve(ev.target.result);
        img.onload=()=>{
          try{
            let w=img.width,h=img.height;
            if(w>maxPx||h>maxPx){if(w>h){h=Math.round(h*maxPx/w);w=maxPx;}else{w=Math.round(w*maxPx/h);h=maxPx;}}
            const c=document.createElement("canvas");c.width=w;c.height=h;
            c.getContext("2d").drawImage(img,0,0,w,h);
            resolve(c.toDataURL("image/jpeg",0.82));
          }catch(e){resolve(ev.target.result);}
        };img.src=ev.target.result;
      };reader.readAsDataURL(file);
    });
  }
  async function uploadPendingPhoto(){
    if(!pendingPhotoDataUrl)return null;
    const base=apiBase();if(!base)return null;
    const token=await getToken();if(!token)return null;
    const bar=$("#uploadBar"),fill=$("#uploadBarFill");
    function barSet(pct){if(bar)bar.style.display=pct>0?"block":"none";if(fill)fill.style.width=pct+"%";}
    barSet(20);
    const ramp=setTimeout(()=>barSet(70),400);
    try{
      const res=await fetch(base+"/api/upload-photo",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({dataUrl:pendingPhotoDataUrl})});
      clearTimeout(ramp);barSet(100);
      const d=await res.json();
      setTimeout(()=>barSet(0),350);
      clearPendingPhoto();
      return d.url||null;
    }catch(e){clearTimeout(ramp);barSet(0);return null;}
  }

  // ---- badges ----
  const BADGE_DEFS=[
    // Logs
    {id:"first_log",   icon:"🔪", da:"Første hugger",     en:"First cut",        check:(s,e)=>s.log&&s.log.length>=1},
    {id:"ten_logs",    icon:"📋", da:"10 logs",            en:"10 logs",          check:(s,e)=>s.log&&s.log.length>=10},
    {id:"fifty_logs",  icon:"📜", da:"50 logs",            en:"50 logs",          check:(s,e)=>s.log&&s.log.length>=50},
    {id:"logs_100",    icon:"📚", da:"100 logs",           en:"100 logs",         check:(s,e)=>s.log&&s.log.length>=100},
    {id:"logs_250",    icon:"🗒", da:"250 logs",           en:"250 logs",         check:(s,e)=>s.log&&s.log.length>=250},
    {id:"logs_500",    icon:"📖", da:"500 logs",           en:"500 logs",         check:(s,e)=>s.log&&s.log.length>=500},
    {id:"logs_1000",   icon:"📕", da:"1.000 logs",         en:"1,000 logs",       check:(s,e)=>s.log&&s.log.length>=1000},
    {id:"logs_2500",   icon:"🗃", da:"2.500 logs",         en:"2,500 logs",       check:(s,e)=>s.log&&s.log.length>=2500},
    // Karriere-total
    {id:"career_100",  icon:"💯", da:"100 i karriere",     en:"100 in career",    check:(s,e)=>career()>=100},
    {id:"career_500",  icon:"⭐", da:"500 i karriere",     en:"500 in career",    check:(s,e)=>career()>=500},
    {id:"career_1k",   icon:"🌟", da:"1.000 i karriere",   en:"1,000 in career",  check:(s,e)=>career()>=1000},
    {id:"career_2500", icon:"✨", da:"2.500 i karriere",   en:"2,500 in career",  check:(s,e)=>career()>=2500},
    {id:"career_5k",   icon:"💫", da:"5.000 i karriere",   en:"5,000 in career",  check:(s,e)=>career()>=5000},
    {id:"career_10k",  icon:"🏆", da:"10.000 i karriere",  en:"10k in career",    check:(s,e)=>career()>=10000},
    {id:"career_25k",  icon:"🏅", da:"25.000 i karriere",  en:"25k in career",    check:(s,e)=>career()>=25000},
    {id:"career_50k",  icon:"👑", da:"50.000 i karriere",  en:"50k in career",    check:(s,e)=>career()>=50000},
    {id:"career_100k", icon:"💎", da:"100.000 i karriere", en:"100k in career",   check:(s,e)=>career()>=100000},
    // Kategorier
    {id:"cat_3",       icon:"🗂", da:"3 kategorier",       en:"3 categories",     check:(s,e)=>s.counters&&s.counters.length>=3},
    {id:"cat_5",       icon:"📁", da:"5 kategorier",       en:"5 categories",     check:(s,e)=>s.counters&&s.counters.length>=5},
    {id:"cat_10",      icon:"🗄", da:"10 kategorier",      en:"10 categories",    check:(s,e)=>s.counters&&s.counters.length>=10},
    {id:"cat_15",      icon:"🧰", da:"15 kategorier",      en:"15 categories",    check:(s,e)=>s.counters&&s.counters.length>=15},
    {id:"cat_20",      icon:"🎒", da:"20 kategorier",      en:"20 categories",    check:(s,e)=>s.counters&&s.counters.length>=20},
    // Vagter
    {id:"shift_1",     icon:"🎬", da:"Første vagt",        en:"First shift",      check:(s,e)=>(s.shiftHistory||[]).length>=1},
    {id:"shifts_5",    icon:"🗓", da:"5 vagter",           en:"5 shifts",         check:(s,e)=>(s.shiftHistory||[]).length>=5},
    {id:"shifts_10",   icon:"📅", da:"10 vagter",          en:"10 shifts",        check:(s,e)=>(s.shiftHistory||[]).length>=10},
    {id:"shifts_25",   icon:"📆", da:"25 vagter",          en:"25 shifts",        check:(s,e)=>(s.shiftHistory||[]).length>=25},
    {id:"shifts_50",   icon:"🧾", da:"50 vagter",          en:"50 shifts",        check:(s,e)=>(s.shiftHistory||[]).length>=50},
    {id:"shifts_100",  icon:"💼", da:"100 vagter",         en:"100 shifts",       check:(s,e)=>(s.shiftHistory||[]).length>=100},
    {id:"shifts_200",  icon:"🏢", da:"200 vagter",         en:"200 shifts",       check:(s,e)=>(s.shiftHistory||[]).length>=200},
    {id:"shifts_365",  icon:"🎯", da:"365 vagter",         en:"365 shifts",       check:(s,e)=>(s.shiftHistory||[]).length>=365},
    {id:"shifts_500",  icon:"🚀", da:"500 vagter",         en:"500 shifts",       check:(s,e)=>(s.shiftHistory||[]).length>=500},
    // Timer arbejdet
    {id:"hours_10",    icon:"⏰", da:"10 timer",           en:"10 hours",         check:(s,e)=>totalWorkMs()>=10*3600000},
    {id:"hours_25",    icon:"⏲", da:"25 timer",           en:"25 hours",         check:(s,e)=>totalWorkMs()>=25*3600000},
    {id:"hours_50",    icon:"⏱", da:"50 timer",           en:"50 hours",         check:(s,e)=>totalWorkMs()>=50*3600000},
    {id:"hours_100",   icon:"🕐", da:"100 timer",          en:"100 hours",        check:(s,e)=>totalWorkMs()>=100*3600000},
    {id:"hours_200",   icon:"⏳", da:"200 timer",          en:"200 hours",        check:(s,e)=>totalWorkMs()>=200*3600000},
    {id:"hours_500",   icon:"🌅", da:"500 timer",          en:"500 hours",        check:(s,e)=>totalWorkMs()>=500*3600000},
    {id:"hours_1000",  icon:"🌄", da:"1.000 timer",        en:"1,000 hours",      check:(s,e)=>totalWorkMs()>=1000*3600000},
    {id:"hours_2000",  icon:"🌠", da:"2.000 timer",        en:"2,000 hours",      check:(s,e)=>totalWorkMs()>=2000*3600000},
    {id:"hours_5000",  icon:"🪐", da:"5.000 timer",        en:"5,000 hours",      check:(s,e)=>totalWorkMs()>=5000*3600000},
    // Streak
    {id:"streak_3",    icon:"🔥", da:"3 dage i træk",      en:"3 day streak",     check:(s,e)=>calcStreak()>=3},
    {id:"streak_7",    icon:"🔥", da:"7 dage i træk",      en:"7 day streak",     check:(s,e)=>calcStreak()>=7},
    {id:"streak_14",   icon:"🔥", da:"14 dage i træk",     en:"14 day streak",    check:(s,e)=>calcStreak()>=14},
    {id:"streak_30",   icon:"🔥", da:"30 dage i træk",     en:"30 day streak",    check:(s,e)=>calcStreak()>=30},
    {id:"streak_60",   icon:"🔥", da:"60 dage i træk",     en:"60 day streak",    check:(s,e)=>calcStreak()>=60},
    {id:"streak_100",  icon:"🔥", da:"100 dage i træk",    en:"100 day streak",   check:(s,e)=>calcStreak()>=100},
    {id:"streak_365",  icon:"🔥", da:"365 dage i træk",    en:"365 day streak",   check:(s,e)=>calcStreak()>=365},
    // Aktive dage i alt
    {id:"days_10",     icon:"📍", da:"10 aktive dage",     en:"10 active days",   check:(s,e)=>totalActiveDays()>=10},
    {id:"days_30",     icon:"🗺", da:"30 aktive dage",     en:"30 active days",   check:(s,e)=>totalActiveDays()>=30},
    {id:"days_100",    icon:"🧭", da:"100 aktive dage",    en:"100 active days",  check:(s,e)=>totalActiveDays()>=100},
    {id:"days_250",    icon:"🌍", da:"250 aktive dage",    en:"250 active days",  check:(s,e)=>totalActiveDays()>=250},
    {id:"days_500",    icon:"🌎", da:"500 aktive dage",    en:"500 active days",  check:(s,e)=>totalActiveDays()>=500},
    // Vin
    {id:"wine_1",         icon:"🍷", da:"Første vin",         en:"First wine",           check:(s,e)=>(s.wines||[]).length>=1},
    {id:"wine_10",        icon:"🍾", da:"10 vine",            en:"10 wines",             check:(s,e)=>(s.wines||[]).length>=10},
    {id:"wine_50",        icon:"🥂", da:"50 vine",            en:"50 wines",             check:(s,e)=>(s.wines||[]).length>=50},
    {id:"wine_glasses_100",icon:"🍇",da:"100 glas serveret",  en:"100 glasses served",   check:(s,e)=>(s.wines||[]).reduce((a,w)=>a+(w.glasses||0),0)>=100},
    {id:"wine_bottles_50", icon:"🍶",da:"50 flasker",         en:"50 bottles",           check:(s,e)=>(s.wines||[]).reduce((a,w)=>a+(w.bottles||0),0)>=50},
    // Maraton-vagter
    {id:"marathon_10", icon:"🏃", da:"10-timers vagt",     en:"10-hour shift",    check:(s,e)=>(s.shiftHistory||[]).some(x=>x.durationMs>=10*3600000)},
    {id:"marathon_12", icon:"🥇", da:"12-timers vagt",     en:"12-hour shift",    check:(s,e)=>(s.shiftHistory||[]).some(x=>x.durationMs>=12*3600000)},
    {id:"marathon_15", icon:"🦾", da:"15-timers vagt",     en:"15-hour shift",    check:(s,e)=>(s.shiftHistory||[]).some(x=>x.durationMs>=15*3600000)},
    // Diverse
    {id:"custom_cat_1", icon:"🧩", da:"Egen kategori",           en:"Custom category",         check:(s,e)=>(s.customCats||[]).length>=1},
    {id:"custom_cat_5", icon:"🎨", da:"5 egne kategorier",       en:"5 custom categories",     check:(s,e)=>(s.customCats||[]).length>=5},
    {id:"first_photo",  icon:"📸", da:"Første billede",          en:"First photo",             check:(s,e)=>(s.log||[]).some(x=>!!x.img)},
    {id:"early_bird",   icon:"🌅", da:"Tidlig fugl",             en:"Early bird",              check:(s,e)=>(s.log||[]).some(x=>new Date(x.ts).getHours()<6)},
    {id:"night_owl",    icon:"🦉", da:"Natteravn",               en:"Night owl",               check:(s,e)=>(s.log||[]).some(x=>{const h=new Date(x.ts).getHours();return h>=0&&h<4;})},
    {id:"variety_5",    icon:"🌈", da:"5 kategorier på én vagt", en:"5 categories in one shift",check:(s,e)=>(s.shiftHistory||[]).some(sh=>new Set((sh.entries||[]).map(x=>x.label)).size>=5)},
  ];
  function getBadgesEarned(){try{return JSON.parse(localStorage.getItem("mise_badges")||"[]");}catch(e){return [];}}
  function saveBadgesEarned(arr){localStorage.setItem("mise_badges",JSON.stringify(arr));}
  function checkBadges(){
    const earned=getBadgesEarned();let newOnes=[];
    BADGE_DEFS.forEach(b=>{if(!earned.includes(b.id)&&b.check(state)){earned.push(b.id);newOnes.push(b);}});
    if(newOnes.length){saveBadgesEarned(earned);newOnes.forEach((b,i)=>setTimeout(()=>showBadgeToast(b),i*3200));}
  }
  function showBadgeToast(b){
    const name=lang==="en"?b.en:b.da;
    showToast(b.icon+" "+t("new_badge")+": "+name);
    haptic(60);
    if(Notification&&Notification.permission==="granted"){
      try{new Notification(b.icon+" "+t("new_badge"),{body:name,icon:"/icons/icon.svg",silent:true});}catch(e){}
    }
  }

  // ---- personal records ----
  function getRecords(){try{return JSON.parse(localStorage.getItem("mise_records")||"{}");}catch(e){return {};}}  function saveRecords(r){localStorage.setItem("mise_records",JSON.stringify(r));}
  function checkRecords(){
    const records=getRecords();let updated=false;
    state.counters.forEach(c=>{
      const total=c.count+(c.subs||[]).reduce((a,s)=>a+s.count,0);
      if(!records[c.id]||total>records[c.id].val){
        records[c.id]={label:c.label,val:total};updated=true;
      }
    });
    if(updated)saveRecords(records);
  }

  // ---- log ----
  function addLogEntry(msg,imageUrl,cat){
    const now=new Date();
    const time=now.getHours().toString().padStart(2,"0")+":"+now.getMinutes().toString().padStart(2,"0");
    logHistory.unshift({time,msg});if(logHistory.length>8)logHistory.pop();renderLogFeed();
    if(!Array.isArray(state.log))state.log=[];
    const entry={ts:now.getTime(),text:msg};
    if(imageUrl)entry.img=imageUrl;
    if(cat)entry.cat=cat;
    state.log.unshift(entry);
    if(state.log.length>2000)state.log.length=2000;
    save();renderLogView();
  }
  function renderLogFeed(){
    const feed=$("#logFeed");if(!logHistory.length){feed.hidden=true;return;}
    feed.hidden=false;
    feed.innerHTML=logHistory.map(e=>'<div class="logentry"><span class="log-time">'+esc(e.time)+'</span><span class="log-text">'+esc(e.msg)+'</span></div>').join("");
  }
  function _logCatMeta(cat){
    const map={
      "aabnet-mad":{emoji:"📦",i:0},"aabnet-drikke":{emoji:"🍷",i:3},"snittet":{emoji:"🔪",i:4},
      "tilberedt":{emoji:"🍳",i:2},"serveret":{emoji:"🍽",i:5},"andet":{emoji:"✨",i:1},"wine":{emoji:"🍷",i:3},
    };
    const m=map[cat]||map.andet;
    return {emoji:m.emoji,c:VD_COLORS[m.i]};
  }
  function _relTime(ts){
    const min=Math.floor((Date.now()-ts)/60000);
    if(min<1)return lang==="da"?"lige nu":"just now";
    if(min<60)return lang==="da"?"for "+min+" min siden":min+" min ago";
    const h=Math.floor(min/60);
    return lang==="da"?"for "+h+" time"+(h===1?"":"r")+" siden":h+" hour"+(h===1?"":"s")+" ago";
  }
  function _logItemHtml(e,timeStr){
    const meta=_logCatMeta(e.cat);
    return '<div class="logtl-item">'
      +'<div class="logtl-ico" style="background:'+meta.c[1]+';color:'+meta.c[0]+'">'+meta.emoji+'</div>'
      +'<div class="logtl-body">'
        +'<div class="logtl-time">'+esc(timeStr)+'</div>'
        +'<div class="logtl-text">'+esc(e.text)+'</div>'
        +(e.img?'<img class="logtl-photo" src="'+esc(e.img)+'" loading="lazy">':'')
      +'</div>'
    +'</div>';
  }
  function _shiftRange(s){return{start:new Date(s.startedAt).getTime(),end:s.endedAt?new Date(s.endedAt).getTime():Date.now()};}
  function _entriesForShift(s){
    const r=_shiftRange(s);
    return (state.log||[]).filter(e=>e.ts>=r.start&&e.ts<=r.end);
  }
  function _entriesOutsideShifts(){
    const ranges=(state.shiftHistory||[]).map(_shiftRange);
    const live=getShift();if(live)ranges.push(_shiftRange(live));
    return (state.log||[]).filter(e=>!ranges.some(r=>e.ts>=r.start&&e.ts<=r.end));
  }
  // "Uden for vagt" — log-indgange der ikke hører til nogen registreret vagt
  function renderLogView(){
    const el=$("#logView");const wrap=document.getElementById("historyOutsideWrap");
    if(!el)return;
    const entries=_entriesOutsideShifts();
    if(!entries.length){if(wrap)wrap.style.display="none";el.innerHTML="";return;}
    if(wrap)wrap.style.display="";
    const now=new Date();
    const todayKey=now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate();
    const days=[],dayMap={};
    entries.forEach(e=>{
      const d=new Date(e.ts);
      const key=d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
      if(!dayMap[key]){
        const isToday=key===todayKey;
        const loc=lang==="en"?"en-GB":"da-DK";
        const label=isToday?(lang==="da"?"I dag":"Today"):d.toLocaleDateString(loc,{weekday:"long",day:"numeric",month:"long",year:"numeric"});
        dayMap[key]={label,isToday,entries:[]};days.push(dayMap[key]);
      }
      dayMap[key].entries.push(e);
    });
    el.innerHTML=days.map(day=>{
      const items=day.entries.map(e=>{
        const timeStr=day.isToday?_relTime(e.ts):new Date(e.ts).toLocaleTimeString(lang==="da"?"da-DK":"en-GB",{hour:"2-digit",minute:"2-digit"});
        return _logItemHtml(e,timeStr);
      }).join("");
      return '<div class="logtl-day"><div class="logtl-date">'+esc(day.label)+'</div>'+items+'</div>';
    }).join("");
  }

  // ---- autocomplete ----
  function attachAC(input,getList){
    if(input._acBound)return;input._acBound=true;
    const dd=document.createElement("div");dd.className="ac";input.parentNode.appendChild(dd);
    let items=[],active=-1;
    function close(){dd.style.display="none";dd.innerHTML="";active=-1;items=[];}
    function render(){const q=input.value.trim().toLowerCase();if(!q){close();return;}
      items=getList().filter(s=>s.toLowerCase().includes(q)).sort((a,b)=>{const A=a.toLowerCase().startsWith(q)?0:1,B=b.toLowerCase().startsWith(q)?0:1;return A-B||a.localeCompare(b,"da");}).slice(0,7);
      if(!items.length){close();return;}
      dd.innerHTML=items.map((m,i)=>'<div class="ac-item'+(i===active?" on":"")+'" data-i="'+i+'">'+esc(m)+'</div>').join("");dd.style.display="block";}
    function pick(v){input.value=v;close();}
    input.addEventListener("input",()=>{active=-1;render();});
    input.addEventListener("focus",render);
    input.addEventListener("blur",()=>setTimeout(close,140));
    input.addEventListener("keydown",e=>{if(dd.style.display!=="block")return;if(e.key==="ArrowDown"){e.preventDefault();active=Math.min(items.length-1,active+1);render();}else if(e.key==="ArrowUp"){e.preventDefault();active=Math.max(0,active-1);render();}else if(e.key==="Enter"&&active>=0){e.preventDefault();pick(items[active]);}else if(e.key==="Escape"){close();}});
    dd.addEventListener("mousedown",e=>{const it=e.target.closest(".ac-item");if(it){e.preventDefault();pick(items[+it.dataset.i]);}});
  }
  function uniq(arr){const seen=new Set(),out=[];arr.forEach(v=>{v=(v||"").trim();const k=v.toLowerCase();if(v&&!seen.has(k)){seen.add(k);out.push(v);}});return out;}
  function wineSuggest(field){
    if(field==="grape")return uniq([...DRUER,...state.wines.flatMap(w=>(w.grape||"").split(",").map(s=>s.trim()).filter(Boolean))]);
    return uniq([...({land:LANDE,region:OMRAADER}[field]||[]),...state.wines.map(w=>w[field])]);
  }

  // ---- long press ----
  function bindLongPress(btn,onLong){
    if(btn._lpBound)return;btn._lpBound=true;
    let t1=null,t2=null;
    btn.addEventListener("pointerdown",()=>{
      t1=setTimeout(()=>btn.classList.add("holding"),200);
      t2=setTimeout(()=>{t1=t2=null;btn.classList.remove("holding");btn._longPressed=true;onLong();},500);
    });
    function cancel(){clearTimeout(t1);clearTimeout(t2);t1=t2=null;btn.classList.remove("holding");}
    btn.addEventListener("pointerup",cancel);btn.addEventListener("pointercancel",cancel);
    btn.addEventListener("contextmenu",e=>e.preventDefault());
  }

  // ---- counters ----
  function makeSimpleRow(c){
    const row=document.createElement("div");row.className="st-r"+(counterTotal(c)>0?" has-count":"");row.dataset.id=c.id;
    const name=document.createElement("span");name.className="st-r-name";name.textContent=tLabel(c.label);
    const edit=document.createElement("button");edit.className="st-r-edit";edit.innerHTML="&#8943;";
    const minus=document.createElement("button");minus.className="st-r-minus";minus.innerHTML="&#8722;";
    const num=document.createElement("span");num.className="st-r-num";num.textContent=fmtNum(counterTotal(c));num.dataset.raw=counterTotal(c);
    row.appendChild(name);row.appendChild(edit);row.appendChild(minus);row.appendChild(num);
    edit.addEventListener("click",e=>{e.stopPropagation();openCounterModal(c.id);});
    minus.addEventListener("click",e=>{e.stopPropagation();bumpSt(c.id,-1);});
    num.addEventListener("click",e=>{e.stopPropagation();openNumtray(t("numtray_set",c.label),c.count,val=>{if(val>=0){c.count=val;save();renderCareer();num.textContent=val;}});});
    row.addEventListener("click",()=>{if(row._longPressed){row._longPressed=false;return;}bumpSt(c.id,1);});
    bindLongPress(row,()=>{openNumtray(t("numtray_add")+" "+c.label,"",val=>{if(val>0)bumpSt(c.id,val);});});
    return row;
  }
  function makeSubGroup(c){
    const wrap=document.createDocumentFragment();
    const hdr=document.createElement("div");hdr.className="st-sub-hdr";
    const hname=document.createElement("div");hname.className="st-sub-hdr-name";hname.textContent=tLabel(c.label);
    const htot=document.createElement("div");htot.className="st-sub-hdr-tot";htot.id="st-sub-tot-"+c.id;htot.textContent=fmtNum(counterTotal(c));htot.dataset.raw=counterTotal(c);
    const hedit=document.createElement("button");hedit.className="st-sub-hdr-edit";hedit.innerHTML="&#8943;";
    hedit.addEventListener("click",()=>openCounterModal(c.id));
    hdr.appendChild(hname);hdr.appendChild(htot);hdr.appendChild(hedit);wrap.appendChild(hdr);
    c.subs.forEach(sub=>{
      const row=document.createElement("div");row.className="st-sub-row";row.dataset.sid=sub.id;row.dataset.pid=c.id;
      const sn=document.createElement("span");sn.className="st-sub-rname";sn.textContent=tLabel(sub.name);
      const sc=document.createElement("span");sc.className="st-sub-rcnt";sc.textContent=sub.count;
      const sm=document.createElement("button");sm.className="st-sub-rminus";sm.innerHTML="&#8722;";
      const sp=document.createElement("button");sp.className="st-sub-rplus";sp.innerHTML="+";
      row.appendChild(sn);row.appendChild(sc);row.appendChild(sm);row.appendChild(sp);
      sm.addEventListener("click",()=>bumpStSub(c.id,sub.id,-1,htot));
      sp.addEventListener("click",()=>{if(sp._longPressed){sp._longPressed=false;return;}bumpStSub(c.id,sub.id,1,htot);});
      bindLongPress(sp,()=>{openNumtray(t("numtray_add")+" "+sub.name,"",val=>{if(val>0)bumpStSub(c.id,sub.id,val,htot);});});
      sc.addEventListener("click",()=>{openNumtray(t("numtray_set",sub.name),sub.count,val=>{if(val>=0){sub.count=val;save();renderCareer();sc.textContent=val;htot.textContent=counterTotal(c);}});});
      wrap.appendChild(row);
    });
    return wrap;
  }
  function renderCounters(){
    const grid=$("#counterGrid");grid.className="st-v3";grid.innerHTML="";
    let migrated=false;
    state.counters.forEach(c=>{if(!c.cat){c.cat=guessCategory(c.label);migrated=true;}});
    if(migrated)save();
    if(!state.counters.length){
      const es=document.createElement("div");es.className="empty-state";
      es.innerHTML='<div class="empty-state-icon">&#127859;</div><div class="empty-state-title">'+(lang==="da"?"Ingen tællere endnu":"No counters yet")+'</div><div class="empty-state-sub">'+(lang==="da"?"Tilføj din første tæller og begynd at holde styr på håndværket":"Add your first counter and start tracking your craft")+'</div>';
      const btn=document.createElement("button");btn.className="btn primary";btn.textContent=lang==="da"?"Tilføj tæller":"Add counter";btn.addEventListener("click",()=>openCounterModal(null));
      const catBtnE=document.createElement("button");catBtnE.className="btn ghost";catBtnE.style.marginTop="10px";catBtnE.textContent=lang==="da"?"Vælg fra katalog":"Browse catalog";catBtnE.addEventListener("click",openCatalog);
      es.appendChild(btn);es.appendChild(catBtnE);grid.appendChild(es);
      const add=document.createElement("button");add.id="addCounterBtn";add.style.display="none";grid.appendChild(add);
      return;
    }
    const cats=allCats();const groups={};cats.forEach(cat=>{groups[cat.id]=[];});
    state.counters.forEach(c=>{const cid=c.cat||"andet";(groups[cid]||(groups[cid]=[])).push(c);});
    const activeCats=cats.filter(cat=>(groups[cat.id]||[]).length>0);

    // ── HERO: donut + category breakdown ──
    const grandTotal=state.counters.reduce((s,c)=>s+counterTotal(c),0);
    const catTotals=activeCats.map(cat=>({cat,total:(groups[cat.id]||[]).reduce((s,c)=>s+counterTotal(c),0)})).sort((a,b)=>b.total-a.total);
    const r=38,circ=+(2*Math.PI*r).toFixed(2);
    const recs=getRecords();const bestRec=Math.max(grandTotal,...state.counters.map(c=>recs[c.label]||0));
    const arcPct=bestRec>0?Math.min(1,grandTotal/bestRec):grandTotal>0?0.6:0;
    const arcLen=+(circ*arcPct).toFixed(2);
    const hero=document.createElement("div");hero.className="st-dash-hero";
    hero.innerHTML='<div class="st-donut-wrap"><svg class="st-donut-svg" viewBox="0 0 88 88"><circle class="st-donut-track" cx="44" cy="44" r="'+r+'"/><circle class="st-donut-arc" id="stDonutArc" cx="44" cy="44" r="'+r+'" stroke-dasharray="'+arcLen+' '+circ+'"/></svg><div class="st-donut-center"><span class="st-donut-num" id="stDonutNum">'+grandTotal+'</span><span class="st-donut-lbl">'+(lang==="da"?"Total":"Total")+'</span></div></div>';
    const catsDiv=document.createElement("div");catsDiv.className="st-dash-cats";
    catTotals.slice(0,4).forEach(({cat,total})=>{
      const row=document.createElement("div");row.className="st-dash-cat";
      const ico=document.createElement("div");ico.className="st-dash-cat-ico";ico.innerHTML=cat.icon;
      const nm=document.createElement("span");nm.className="st-dash-cat-nm";nm.textContent=lang==="en"?cat.en:cat.da;
      const val=document.createElement("span");val.className="st-dash-cat-v"+(total>0?" on":"");val.id="scd-v-"+cat.id;val.textContent=total;
      row.appendChild(ico);row.appendChild(nm);row.appendChild(val);
      catsDiv.appendChild(row);
    });
    hero.appendChild(catsDiv);
    grid.appendChild(hero);

    // ── CATEGORY MINI-CARDS ──
    const cardsGrid=document.createElement("div");cardsGrid.className="st-cat-cards";
    activeCats.forEach(cat=>{
      const counters=groups[cat.id]||[];
      const total=counters.reduce((s,c)=>s+counterTotal(c),0);
      const card=document.createElement("div");card.className="st-cat-card"+(total>0?" scc-on":"");
      const top=document.createElement("div");top.className="st-cat-card-top";
      const ico=document.createElement("div");ico.className="st-cat-card-ico";
      ico.innerHTML=cat.iconPending?'<span style="width:10px;height:10px;border:1.5px solid var(--border);border-top-color:var(--accent);border-radius:50%;display:inline-block;animation:spin .7s linear infinite"></span>':cat.icon;
      const plusBtn=document.createElement("button");plusBtn.className="st-cat-card-btn";plusBtn.textContent="+";
      top.appendChild(ico);top.appendChild(plusBtn);
      const numEl=document.createElement("div");numEl.className="st-cat-card-num"+(total>0?" on":"");numEl.id="scc-num-"+cat.id;numEl.textContent=total;
      const nmEl=document.createElement("div");nmEl.className="st-cat-card-nm";nmEl.textContent=lang==="en"?cat.en:cat.da;
      card.appendChild(top);card.appendChild(numEl);card.appendChild(nmEl);
      plusBtn.addEventListener("click",e=>{
        e.stopPropagation();
        const c=counters[0];if(!c)return;
        if(c.subs.length){const best=c.subs.reduce((a,b)=>b.count>a.count?b:a,c.subs[0]);bumpStSub(c.id,best.id,1,null);}
        else{bumpSt(c.id,1);}
        const newTotal=counters.reduce((s,c)=>s+counterTotal(c),0);
        const prev=readNum(numEl);
        animateCount(numEl,prev,newTotal);numEl.classList.toggle("on",newTotal>0);card.classList.toggle("scc-on",newTotal>0);tickEl(numEl);
        const gt=state.counters.reduce((s,c)=>s+counterTotal(c),0);
        const dn=document.getElementById("stDonutNum");if(dn)dn.textContent=gt;
        const sdv=document.getElementById("scd-v-"+cat.id);if(sdv){sdv.textContent=newTotal;sdv.classList.toggle("on",newTotal>0);}
      });
      cardsGrid.appendChild(card);
    });
    grid.appendChild(cardsGrid);

    // ── DETAILS SECTION ──
    const detOpen=localStorage.getItem("mise_detail_open")!=="0";
    const detHdr=document.createElement("div");detHdr.className="st-detail-hdr"+(detOpen?" stdo":"");
    detHdr.innerHTML='<div class="st-detail-line"></div><span class="st-detail-lbl">'+(lang==="da"?"Detaljer":"Details")+'</span><span class="st-detail-chev">›</span><div class="st-detail-line"></div>';
    grid.appendChild(detHdr);
    const detBody=document.createElement("div");detBody.className="st-detail-body"+(detOpen?"":" stdb-h");
    grid.appendChild(detBody);
    detHdr.addEventListener("click",()=>{const o=detHdr.classList.toggle("stdo");if(o){detBody.classList.remove("stdb-h");_animOpen(detBody);}else _animClose(detBody,()=>detBody.classList.add("stdb-h"));localStorage.setItem("mise_detail_open",o?"1":"0");haptic(10);});

    activeCats.forEach(cat=>{
      const counters=groups[cat.id]||[];
      const total=counters.reduce((s,c)=>s+counterTotal(c),0);
      const isOpen=total>0;
      const lbl=document.createElement("div");lbl.className="st-group-lbl"+(isOpen?" stg-open":"");
      const iconEl=document.createElement("div");iconEl.className="st-group-lbl-icon";
      iconEl.innerHTML=cat.iconPending?'<span style="width:12px;height:12px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;display:inline-block;animation:spin .7s linear infinite"></span>':cat.icon;
      const nameEl=document.createElement("span");nameEl.className="st-group-lbl-name";nameEl.textContent=lang==="en"?cat.en:cat.da;
      const totEl=document.createElement("span");totEl.className="st-group-lbl-tot"+(total>0?" has-count":"");
      totEl.id="cat-total-"+cat.id;totEl.textContent=total;
      const chevEl=document.createElement("span");chevEl.className="st-group-chev";chevEl.textContent="›";
      lbl.appendChild(iconEl);lbl.appendChild(nameEl);lbl.appendChild(totEl);lbl.appendChild(chevEl);
      detBody.appendChild(lbl);
      const body=document.createElement("div");body.className="st-group-body"+(isOpen?"":" stg-hidden");
      counters.forEach(c=>{
        if(c.subs.length){body.appendChild(makeSubGroup(c));}
        else{body.appendChild(makeSimpleRow(c));}
      });
      const addR=document.createElement("button");addR.className="st-add-r";addR.dataset.catAdd=cat.id;
      addR.innerHTML='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>'+(lang==="da"?" Tilføj tæller":" Add counter");
      body.appendChild(addR);
      detBody.appendChild(body);
      lbl.addEventListener("click",()=>{const open=lbl.classList.toggle("stg-open");body.classList.toggle("stg-hidden",!open);});
    });
    const addCat=document.createElement("button");addCat.className="station-new-cat";addCat.id="addCatBtn";addCat.textContent=t("new_cat_btn");
    detBody.appendChild(addCat);
    const addH=document.createElement("button");addH.id="addCounterBtn";addH.style.display="none";detBody.appendChild(addH);
  }
  function updateCatHeader(catId){
    const el=document.getElementById("cat-total-"+catId);if(!el)return;
    const tot=state.counters.filter(c=>(c.cat||"andet")===catId).reduce((s,c)=>s+counterTotal(c),0);
    el.textContent=tot;el.classList.toggle("has-count",tot>0);
    const sccEl=document.getElementById("scc-num-"+catId);if(sccEl){sccEl.textContent=tot;sccEl.classList.toggle("on",tot>0);}
    const scdEl=document.getElementById("scd-v-"+catId);if(scdEl){scdEl.textContent=tot;scdEl.classList.toggle("on",tot>0);}
    const gt=state.counters.reduce((s,c)=>s+counterTotal(c),0);
    const dn=document.getElementById("stDonutNum");if(dn)dn.textContent=gt;
  }
  // Ægte haptik på iOS via Capacitor; web/Android falder tilbage til vibrate
  function haptic(ms){
    ms=ms||30;
    try{
      const H=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.Haptics;
      if(H){H.impact({style:ms<=15?"LIGHT":ms<=45?"MEDIUM":"HEAVY"});return;}
    }catch(e){}
    if(navigator.vibrate)navigator.vibrate(ms);
  }
  function tickEl(el){if(!el)return;el.classList.remove("tick");void el.offsetWidth;el.classList.add("tick");}
  function animateCount(el,from,to){
    if(!el)return;
    el.dataset.raw=to;
    if(from===to){el.textContent=fmtNum(to);return;}
    const dur=Math.min(350,Math.max(150,Math.abs(to-from)*40));
    const start=performance.now();
    function step(now){
      const p=Math.min(1,(now-start)/dur);
      const eased=1-Math.pow(1-p,3);
      el.textContent=fmtNum(from+(to-from)*eased);
      if(p<1)requestAnimationFrame(step);else el.textContent=fmtNum(to);
    }
    requestAnimationFrame(step);
  }
  function bumpSt(cid,d){
    const c=state.counters.find(x=>x.id===cid);if(!c||c.subs.length)return;
    const prev=c.count;c.count=Math.max(0,c.count+d);
    const row=document.querySelector('.st-r[data-id="'+cid+'"]');
    if(row){const el=row.querySelector(".st-r-num");animateCount(el,prev,c.count);if(d>0){tickEl(el);haptic();}row.classList.toggle("has-count",c.count>0);}
    updateCatHeader(c.cat||"andet");renderCareer();save();
  }
  function bumpStSub(cid,sid,d,htotEl){
    const c=state.counters.find(x=>x.id===cid);if(!c)return;
    const s=c.subs.find(x=>x.id===sid);if(!s)return;
    const prev=s.count;s.count=Math.max(0,s.count+d);
    const row=document.querySelector('.st-sub-row[data-sid="'+sid+'"]');
    if(row){const el=row.querySelector(".st-sub-rcnt");animateCount(el,prev,s.count);if(d>0){tickEl(el);haptic();}}
    const totEl=htotEl||document.getElementById("st-sub-tot-"+cid);
    if(totEl){const prevT=counterTotal(c)-d;animateCount(totEl,Math.max(0,prevT),counterTotal(c));if(d>0)tickEl(totEl);}
    updateCatHeader(c.cat||"andet");renderCareer();save();
  }

  // === VAGT VIEW ===
  let vagtTimerInterval=null;

  function startVagtTimer(shift){
    if(vagtTimerInterval)clearInterval(vagtTimerInterval);
    function _fmt(ms){const s=Math.floor(ms/1000),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),se=s%60;return h>0?h+":"+String(m).padStart(2,"0")+":"+String(se).padStart(2,"0"):m+":"+String(se).padStart(2,"0");}
    function _tick(){const el=document.getElementById("vagtTimer");if(el)el.textContent=_fmt(Date.now()-new Date(shift.startedAt).getTime());}
    _tick();vagtTimerInterval=setInterval(_tick,1000);
  }

  // Højde-animeret fold ud/ind — indhold glider, teleporterer ikke
  function _animOpen(el){
    el.style.display="";el.style.overflow="hidden";el.style.height="0px";
    requestAnimationFrame(()=>{
      el.style.transition="height .22s ease";el.style.height=el.scrollHeight+"px";
      setTimeout(()=>{el.style.height="";el.style.transition="";el.style.overflow="";},240);
    });
  }
  function _animClose(el,after){
    el.style.overflow="hidden";el.style.height=el.scrollHeight+"px";
    requestAnimationFrame(()=>{
      el.style.transition="height .2s ease";el.style.height="0px";
      setTimeout(()=>{el.style.transition="";el.style.height="";el.style.overflow="";if(after)after();},220);
    });
  }
  function _updateVagtAfterLog(){
    const shift=getShift();
    _buildVagtDashboard(document.getElementById("vagtDash"),shift);
    _buildVagtQuickStats(document.getElementById("vagtQuick"),shift);
  }
  function _vagtSnapMap(shift){const m={};if(shift&&shift.snap)shift.snap.forEach(sc=>{m[sc.id]={count:sc.count||0,subs:{}};(sc.subs||[]).forEach(ss=>m[sc.id].subs[ss.id]=ss.count||0);});return m;}
  function _vagtDispVal(c,snapMap){const sb=snapMap[c.id]?snapMap[c.id].count||0:0;return Math.max(0,counterTotal(c)-sb);}

  const VD_COLORS=[["#FFB36B","rgba(255,179,107,.14)"],["#FF6B8A","rgba(255,107,138,.14)"],["#E8875C","rgba(232,135,92,.14)"],["#C98BD9","rgba(201,139,217,.15)"],["#5CB8A7","rgba(92,184,167,.14)"],["#D4A94E","rgba(212,169,78,.15)"]];
  function _bestShiftTotal(){let best=0;(state.shiftHistory||[]).forEach(s=>{const tot=(s.entries||[]).reduce((a,e)=>a+(e.delta>0?e.delta:0),0);if(tot>best)best=tot;});return Math.round(best);}
  function _vagtRingPct(grand,shift){if(shift){const best=_bestShiftTotal();return best>0?Math.min(1,grand/best):(grand>0?.65:0);}return grand>0?1:0;}
  function _vagtGrand(sm){return state.counters.reduce((s,c)=>s+_vagtDispVal(c,sm),0);}

  // Each tracked counter is a "category" in the hero rings and overview
  function _vagtCounterTotals(sm){
    return state.counters.map((c,i)=>({id:c.id,label:tLabel(c.label),color:VD_COLORS[i%VD_COLORS.length][0],soft:VD_COLORS[i%VD_COLORS.length][1],tot:Math.round(_vagtDispVal(c,sm))}));
  }

  // ── ét roligt hero: kun ringen er "vigtigst" ──
  function _buildVagtDashboard(container,shift){
    if(!container)return;
    const sm=_vagtSnapMap(shift);
    const grandTotal=Math.round(_vagtGrand(sm));
    const r=52,circ=+(2*Math.PI*r).toFixed(2);
    const arcLen=+(circ*_vagtRingPct(grandTotal,shift)).toFixed(2);
    const streak=calcStreak();
    const captionParts=[fmtWorkTime(totalWorkMs())+" "+(lang==="da"?"i alt":"total")];
    if(streak>=2)captionParts.push("🔥 "+(lang==="da"?streak+" dage i træk":streak+" day streak"));
    container.innerHTML='<div class="vd2-hero">'
      +'<div class="vd2-hero-solo">'
        +'<div class="vd-ring-wrap" role="img" aria-label="'+fmtNum(grandTotal)+' '+(lang==="da"?"tællinger":"counts")+'">'
          +'<svg class="vd-ring-svg" viewBox="0 0 120 120">'
            +'<defs><linearGradient id="vdGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFB36B"/><stop offset="100%" stop-color="#FF6B8A"/></linearGradient></defs>'
            +'<circle class="vd-ring-track" cx="60" cy="60" r="'+r+'"/>'
            +'<circle class="vd-ring-arc" id="vd-ring-arc" cx="60" cy="60" r="'+r+'" stroke-dasharray="'+arcLen+' '+circ+'"/>'
          +'</svg>'
          +'<div class="vd-ring-center">'
            +'<span class="vd-ring-num" id="vd-ring-num" data-raw="'+grandTotal+'">'+fmtNum(grandTotal)+'</span>'
            +'<span class="vd-ring-lbl">'+(shift?(lang==="da"?"denne vagt":"this shift"):(lang==="da"?"tællinger":"counts"))+'</span>'
          +'</div>'
        +'</div>'
        +'<div class="vd2-caption">'+captionParts.join(" · ")+'</div>'
      +'</div>'
    +'</div>';
  }

  // ── Rolig quick-stat grid: samme data som før, ingen ringe der konkurrerer om opmærksomhed ──
  function _buildVagtQuickStats(container,shift){
    if(!container)return;
    const sm=_vagtSnapMap(shift);
    const totals=_vagtCounterTotals(sm);
    const topCats=[...totals].sort((a,b)=>b.tot-a.tot).slice(0,5);
    const hiddenN=totals.length-topCats.length;
    if(!topCats.length){container.innerHTML="";return;}
    const moreTile='<button class="vd2-qtile vd2-qtile-more" aria-label="'+(lang==="da"?"Alle kategorier":"All categories")+'">'
      +'<div class="vd2-qtile-ico">'+(hiddenN>0?"+"+hiddenN:"···")+'</div>'
      +'<div class="vd2-qtile-txt"><div class="vd2-qtile-lbl">'+(lang==="da"?"Alle kategorier":"All categories")+'</div></div>'
    +'</button>';
    container.innerHTML='<div class="vd2-qgrid">'+topCats.map((x,i)=>{
      const col=VD_COLORS[i%VD_COLORS.length];
      return '<button class="vd2-qtile" data-ring-id="'+esc(x.id)+'" aria-label="'+esc(x.label)+': '+fmtNum(x.tot)+'. '+(lang==="da"?"Tryk for overblik":"Tap for overview")+'">'
        +'<div class="vd2-qtile-ico" style="background:'+col[1]+';color:'+col[0]+'">'+esc((x.label||"?").charAt(0).toUpperCase())+'</div>'
        +'<div class="vd2-qtile-txt"><div class="vd2-qtile-val" data-cid="'+x.id+'" data-raw="'+x.tot+'">'+fmtNum(x.tot)+'</div><div class="vd2-qtile-lbl">'+esc(x.label)+'</div></div>'
      +'</button>';
    }).join("")+moreTile+'</div>';
    const allBtn=container.querySelector(".vd2-qtile-more");
    if(allBtn)allBtn.addEventListener("click",openCatOverview);
    // Kortene åbner det totale overblik — logging sker i Detaljer og tekstfeltet
    container.querySelectorAll("[data-ring-id]").forEach(btn=>{
      btn.addEventListener("click",()=>{openCatOverview();haptic(15);});
    });
  }

  function openWineOverview(){
    const scrim=document.getElementById("catOvScrim");if(!scrim)return;
    const items=state.wines.map(w=>({
      label:(w.name||w.producer||(lang==="da"?"Uden navn":"Unnamed"))+(w.vint?" "+w.vint:""),
      tot:(w.glasses||0)+(w.bottles||0),
      col:(WTYPE_COLORS[w.type]||WTYPE_COLORS.andet)
    })).sort((a,b)=>b.tot-a.tot);
    const title=document.getElementById("catOvTitle");if(title)title.textContent=lang==="da"?"Alle vine":"All wines";
    const sub=document.getElementById("catOvSub");if(sub)sub.textContent=lang==="da"?"Serveringer (glas + flasker)":"Servings (glasses + bottles)";
    const list=document.getElementById("catOvList");if(!list)return;
    const max=Math.max(1,...items.map(x=>x.tot));
    const grand=items.reduce((s2,x)=>s2+x.tot,0);
    list.innerHTML="";
    items.forEach(x=>{
      const row=document.createElement("div");row.className="catov-row";
      row.innerHTML='<div class="catov-ico" style="background:'+x.col[1]+';color:'+x.col[0]+'"><span class="catov-initial">'+esc((x.label||"?").charAt(0).toUpperCase())+'</span></div>'
        +'<div class="catov-mid">'
          +'<div class="catov-name">'+esc(x.label)+'</div>'
          +'<div class="catov-bar"><div class="catov-fill" style="width:'+Math.round(100*x.tot/max)+'%;background:'+x.col[0]+'"></div></div>'
        +'</div>'
        +'<div class="catov-val">'+fmtNum(x.tot)+'</div>';
      list.appendChild(row);
    });
    const tot=document.getElementById("catOvTotal");
    if(tot)tot.innerHTML='<span>'+(lang==="da"?"I alt":"Total")+'</span><span class="catov-total-val">'+fmtNum(grand)+'</span>';
    const mng=document.getElementById("catOvManage");if(mng)mng.style.display="none";
    scrim.classList.add("open");
  }
  function openCatOverview(){
    const scrim=document.getElementById("catOvScrim");if(!scrim)return;
    const shift=getShift();const sm=_vagtSnapMap(shift);
    const totals=[..._vagtCounterTotals(sm)].sort((a,b)=>b.tot-a.tot);
    const title=document.getElementById("catOvTitle");if(title)title.textContent=lang==="da"?"Alle kategorier":"All categories";
    const sub=document.getElementById("catOvSub");if(sub)sub.textContent=shift?(lang==="da"?"Denne vagt":"This shift"):(lang==="da"?"Total":"Total");
    const list=document.getElementById("catOvList");if(!list)return;
    const max=Math.max(1,...totals.map(x=>x.tot));
    const grand=totals.reduce((s,x)=>s+x.tot,0);
    list.innerHTML="";
    totals.forEach(x=>{
      const row=document.createElement("div");row.className="catov-row";
      row.innerHTML='<div class="catov-ico" style="background:'+x.soft+';color:'+x.color+'"><span class="catov-initial">'+esc((x.label||"?").charAt(0).toUpperCase())+'</span></div>'
        +'<div class="catov-mid">'
          +'<div class="catov-name">'+esc(x.label)+'</div>'
          +'<div class="catov-bar"><div class="catov-fill" style="width:'+Math.round(100*x.tot/max)+'%;background:'+x.color+'"></div></div>'
        +'</div>'
        +'<div class="catov-val">'+fmtNum(x.tot)+'</div>';
      list.appendChild(row);
    });
    const tot=document.getElementById("catOvTotal");
    if(tot)tot.innerHTML='<span>'+(lang==="da"?"I alt":"Total")+'</span><span class="catov-total-val">'+fmtNum(grand)+'</span>';
    const mng=document.getElementById("catOvManage");
    if(mng){mng.style.display="";mng.textContent=lang==="da"?"Administrér tællere":"Manage counters";mng.onclick=()=>{scrim.classList.remove("open");switchTab("station");};}
    scrim.classList.add("open");
  }

  let _vagtShowAllShifts=false;
  let _expandedShiftIds=new Set();
  function _buildVagtActivity(container){
    if(!container)return;
    const hist=state.shiftHistory||[];
    const seeAllLbl=_vagtShowAllShifts?(lang==="da"?"Vis færre":"Show less"):(lang==="da"?"Vis alle":"View all")+" ("+hist.length+")";
    container.innerHTML='<div class="vd2-sec"><span class="vd2-sec-title">'+(lang==="da"?"Vagtlog":"Shift log")+(hist.length?' · '+hist.length:'')+'</span>'
      +(hist.length>3?'<button class="vd2-sec-btn" id="vagtSeeAll">'+seeAllLbl+'</button>':'')
      +'</div>';
    if(!hist.length){
      const empty=document.createElement("div");empty.className="vd2-empty";
      empty.textContent=lang==="da"?"Ingen vagter endnu — start din første vagt og byg din historik":"No shifts yet — start your first shift and build your history";
      container.appendChild(empty);return;
    }
    const briefSvg='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2"/><path d="M3 13h18"/></svg>';
    const clockMini='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>';
    const loc=lang==="da"?"da-DK":"en-GB";
    const shown=_vagtShowAllShifts?hist:hist.slice(0,3);
    shown.forEach((s,i)=>{
      const d=new Date(s.startedAt);
      const dateStr=d.toLocaleDateString(loc,{weekday:"short",day:"numeric",month:"short"});
      const t1=d.toLocaleTimeString(loc,{hour:"2-digit",minute:"2-digit"});
      const t2=s.endedAt?new Date(s.endedAt).toLocaleTimeString(loc,{hour:"2-digit",minute:"2-digit"}):"";
      const totItems=Math.round((s.entries||[]).reduce((a,e)=>a+(e.delta>0&&(!e.unit||e.unit==="stk")?e.delta:0),0));
      const top=(s.entries||[]).filter(e=>e.delta>0).sort((a,b)=>b.delta-a.delta).slice(0,2);
      const isOpen=_expandedShiftIds.has(s.id);
      const card=document.createElement("div");card.className="vd2-shift-card"+(isOpen?" open":"");
      const head=document.createElement("button");head.className="vd2-shift";
      head.innerHTML='<div class="vd2-shift-ico">'+briefSvg+'</div>'
        +'<div class="vd2-shift-body">'
          +'<div class="vd2-shift-date">'+esc(dateStr)+'</div>'
          +'<div class="vd2-shift-time">'+esc(t1+(t2?"–"+t2:""))+'</div>'
          +'<div class="vd2-shift-chips">'
            +'<span class="vd2-chip hl">'+clockMini+fmtWorkTime(s.durationMs)+'</span>'
            +(totItems>0?'<span class="vd2-chip">'+fmtNum(totItems)+(lang==="da"?" stk":" items")+'</span>':'')
            +top.map(e=>'<span class="vd2-chip">'+esc(fmtCount(e.delta,e.unit)+" "+e.label)+'</span>').join("")
          +'</div>'
        +'</div>'
        +'<svg class="vd2-shift-chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--faint)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex:none"><polyline points="9 18 15 12 9 6"/></svg>';
      head.addEventListener("click",()=>{
        if(isOpen)_expandedShiftIds.delete(s.id);else _expandedShiftIds.add(s.id);
        _buildVagtActivity(container);
      });
      const body=document.createElement("div");body.className="vd2-shift-expand";
      const shiftEntries=_entriesForShift(s).slice().reverse();
      const itemsHtml=shiftEntries.length
        ?shiftEntries.map(e=>_logItemHtml(e,new Date(e.ts).toLocaleTimeString(loc,{hour:"2-digit",minute:"2-digit"}))).join("")
        :'<p class="muted" style="padding:2px 2px 8px">'+(lang==="da"?"Ingen logs i denne vagt":"No logs in this shift")+'</p>';
      body.innerHTML=itemsHtml+'<button class="vd2-shift-editbtn" data-idx="'+i+'">'+(lang==="da"?"✏ Rediger vagt":"✏ Edit shift")+'</button>';
      card.appendChild(head);card.appendChild(body);
      container.appendChild(card);
    });
    const seeAll=document.getElementById("vagtSeeAll");
    if(seeAll)seeAll.addEventListener("click",()=>{_vagtShowAllShifts=!_vagtShowAllShifts;_buildVagtActivity(container);});
    container.querySelectorAll(".vd2-shift-editbtn").forEach(btn=>{
      btn.addEventListener("click",e=>{e.stopPropagation();openShiftEdit(+btn.dataset.idx);});
    });
  }

  // ── Stats: karriere-hero med timer-ring ──
  function _buildStatsHero(container){
    if(!container)return;
    const hrs=totalWorkMs()/3600000;
    const shifts=(state.shiftHistory||[]).length;
    const streak=calcStreak();
    const r=52,circ=+(2*Math.PI*r).toFixed(2);
    const lap=100,within=hrs%lap;
    const pct=hrs>0?(within===0?1:within/lap):0;
    const arcLen=+(circ*pct).toFixed(2);
    const captionParts=[shifts+" "+(lang==="da"?(shifts===1?"vagt":"vagter"):(shifts===1?"shift":"shifts"))];
    if(streak>=2)captionParts.push("🔥 "+(lang==="da"?streak+" dage i træk":streak+" day streak"));
    container.innerHTML='<div class="vd2-hero">'
      +'<div class="vd2-hero-solo">'
        +'<div class="vd-ring-wrap" role="img" aria-label="'+Math.floor(hrs)+' '+(lang==="da"?"timer i alt":"hours total")+'">'
          +'<svg class="vd-ring-svg" viewBox="0 0 120 120">'
            +'<defs><linearGradient id="vsGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFB36B"/><stop offset="100%" stop-color="#FF6B8A"/></linearGradient></defs>'
            +'<circle class="vd-ring-track" cx="60" cy="60" r="'+r+'"/>'
            +'<circle class="vd-ring-arc" cx="60" cy="60" r="'+r+'" style="stroke:url(#vsGrad)" stroke-dasharray="'+arcLen+' '+circ+'"/>'
          +'</svg>'
          +'<div class="vd-ring-center">'
            +'<span class="vd-ring-num">'+Math.floor(hrs)+'t</span>'
            +'<span class="vd-ring-lbl">'+(lang==="da"?"timer i alt":"hours total")+'</span>'
          +'</div>'
        +'</div>'
        +'<div class="vd2-caption">'+captionParts.join(" · ")+'</div>'
      +'</div>'
    +'</div>';
  }

  // ── Stats: highlight-tiles (snit, længste, kategorier, aktive dage) ──
  function _buildStatsHighlights(container){
    if(!container)return;
    const hist=state.shiftHistory||[];
    const avgMs=hist.length?hist.reduce((a,s)=>a+s.durationMs,0)/hist.length:0;
    const longestMs=hist.length?Math.max(...hist.map(s=>s.durationMs)):0;
    const tiles=[
      {ico:"📊",col:VD_COLORS[2],val:hist.length?fmtWorkTime(avgMs):"—",lbl:lang==="da"?"Snit/vagt":"Avg/shift"},
      {ico:"🏅",col:VD_COLORS[3],val:hist.length?fmtWorkTime(longestMs):"—",lbl:lang==="da"?"Længste vagt":"Longest shift"},
      {ico:"🗂",col:VD_COLORS[4],val:fmtNum(state.counters.length),lbl:lang==="da"?"Kategorier":"Categories"},
      {ico:"📆",col:VD_COLORS[5],val:fmtNum(totalActiveDays()),lbl:lang==="da"?"Dage aktiv":"Active days"},
    ];
    container.innerHTML='<div class="vd2-qgrid">'+tiles.map(x=>
      '<div class="vd2-qtile" style="cursor:default">'
        +'<div class="vd2-qtile-ico" style="background:'+x.col[1]+';color:'+x.col[0]+'">'+x.ico+'</div>'
        +'<div class="vd2-qtile-txt"><div class="vd2-qtile-val">'+x.val+'</div><div class="vd2-qtile-lbl">'+x.lbl+'</div></div>'
      +'</div>'
    ).join("")+'</div>';
  }

  // ── Stats: achievements-grid ──
  function _badgeTile(b,has){
    const name=lang==="en"?b.en:b.da;
    return '<div class="badge-item'+(has?"":" badge-locked")+'" title="'+esc(name)+'"><div class="badge-icon">'+b.icon+'</div><div class="badge-label">'+esc(name)+'</div></div>';
  }
  function _buildStatsBadges(container){
    if(!container)return;
    const earned=getBadgesEarned();
    const got=BADGE_DEFS.filter(b=>earned.includes(b.id));
    const missing=BADGE_DEFS.filter(b=>!earned.includes(b.id));
    const title=document.getElementById("statsAchTitle");
    if(title)title.textContent="Achievements · "+got.length+"/"+BADGE_DEFS.length;
    const emptyMsg=lang==="da"?'Ingen achievements optjent endnu — fold "At opnå" ud for at se hvad du kan gå efter':'No achievements yet — expand "To achieve" to see what\'s up for grabs';
    container.innerHTML=got.length?got.map(b=>_badgeTile(b,true)).join(""):'<p class="muted">'+esc(emptyMsg)+'</p>';
    const toAch=document.getElementById("statsToAchieve");
    if(toAch)toAch.innerHTML=missing.map(b=>_badgeTile(b,false)).join("");
    const lbl=document.getElementById("statsToAchieveLbl");
    if(lbl)lbl.textContent=(lang==="da"?"At opnå":"To achieve")+" · "+missing.length;
  }
  let _statsToAchieveOpen=false;
  function setupStatsToAchieveToggle(){
    const btn=$("#statsToAchieveToggle"),body=$("#statsToAchieve");
    if(!btn||!body)return;
    btn.addEventListener("click",()=>{
      _statsToAchieveOpen=!_statsToAchieveOpen;
      btn.classList.toggle("open",_statsToAchieveOpen);
      body.style.display=_statsToAchieveOpen?"":"none";
      haptic(10);
    });
  }

  // ── Stats: "spørg om dine stats" — kompakt datasæt til AI-svar ──
  function _buildStatsQuerySummary(){
    const hist=state.shiftHistory||[];
    const shifts=hist.slice(0,200).map(s=>({
      date:new Date(s.startedAt).toISOString().slice(0,10),
      start:new Date(s.startedAt).toTimeString().slice(0,5),
      end:s.endedAt?new Date(s.endedAt).toTimeString().slice(0,5):null,
      hours:+(s.durationMs/3600000).toFixed(2),
    }));
    const categories=state.counters.map(c=>({label:tLabel(c.label),total:counterTotal(c),unit:c.unit||"stk"}));
    return {
      todayISO:new Date().toISOString().slice(0,10),
      totals:{
        careerCount:career(),
        totalHours:+(totalWorkMs()/3600000).toFixed(1),
        shiftsCount:hist.length,
        streakDays:calcStreak(),
        activeDays:totalActiveDays(),
      },
      shifts,
      categories,
      badgesEarned:getBadgesEarned().map(id=>{const b=BADGE_DEFS.find(x=>x.id===id);return b?(lang==="da"?b.da:b.en):id;}),
    };
  }
  function setupStatsAsk(){
    const btn=$("#statsAskBtn"),inp=$("#statsAskInput"),ans=$("#statsAskAnswer");
    if(!btn||!inp||!ans)return;
    async function ask(){
      const q=(inp.value||"").trim();if(!q||btn.disabled)return;
      if(!requirePro())return;  // Claude-feature → Pro
      const base=apiBase();const token=await getToken();
      if(!base||!token){
        ans.style.display="";ans.className="stats-ask-answer err";
        ans.textContent=lang==="da"?"Log ind for at spørge":"Log in to ask";
        return;
      }
      btn.disabled=true;
      ans.style.display="";ans.className="stats-ask-answer";
      ans.textContent=lang==="da"?"Tænker…":"Thinking…";
      try{
        const summary=_buildStatsQuerySummary();
        const r=await fetch(base+"/api/stats-query",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({question:q,summary})});
        const d=await r.json();
        if(!r.ok||d.error){
          ans.className="stats-ask-answer err";
          ans.textContent=d.error==="for mange kald — vent lidt"?(lang==="da"?"For mange spørgsmål — vent lidt":"Too many questions — wait a bit"):(lang==="da"?"Kunne ikke svare — prøv igen":"Couldn't answer — try again");
          return;
        }
        ans.className="stats-ask-answer";
        ans.textContent=d.answer||"";
      }catch(e){
        ans.className="stats-ask-answer err";
        ans.textContent=lang==="da"?"Ingen forbindelse":"No connection";
      }finally{
        btn.disabled=false;
      }
    }
    btn.addEventListener("click",ask);
    inp.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();ask();}});
  }

  function renderVagt(){
    const el=document.getElementById("vagtContent");if(!el)return;
    const shift=getShift();
    if(!shift&&vagtTimerInterval){clearInterval(vagtTimerInterval);vagtTimerInterval=null;}

    // ── Action card: Start/Live vagt — Overblikkets eneste knap ──
    const playSvg='<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="7 4 20 12 7 20 7 4"/></svg>';
    let shiftCard;
    if(shift){
      shiftCard='<button class="vd2-act vd2-act-shift live" id="vagtShiftCard">'
        +'<span class="vd2-act-go">LIVE</span>'
        +'<div class="vd2-live-row"><div class="vd2-live-dot"></div><span class="vd2-timer" id="vagtTimer">0:00</span></div>'
        +'<div><div class="vd2-act-title">'+(lang==="da"?"Vagt i gang":"Shift running")+'</div>'
        +'<div class="vd2-act-sub">'+(lang==="da"?"Tryk for at afslutte":"Tap to end")+'</div></div>'
        +'</button>';
    } else {
      shiftCard='<button class="vd2-act vd2-act-shift" id="vagtShiftCard">'
        +'<span class="vd2-act-go">'+(lang==="da"?"START":"GO")+'</span>'
        +'<div class="vd2-act-ico">'+playSvg+'</div>'
        +'<div><div class="vd2-act-title">'+(lang==="da"?"Start vagt":"Start shift")+'</div>'
        +'<div class="vd2-act-sub">'+(lang==="da"?"Klar til service?":"Ready for service?")+'</div></div>'
        +'</button>';
    }
    el.innerHTML='<div id="vagtDash"></div>'
      +'<div id="vagtQuick"></div>'
      +'<div class="vd2-actions" style="grid-template-columns:1fr">'+shiftCard+'</div>';

    _buildVagtDashboard(document.getElementById("vagtDash"),shift);
    _buildVagtQuickStats(document.getElementById("vagtQuick"),shift);

    // ── Wiring ──
    const sc=document.getElementById("vagtShiftCard");
    if(sc)sc.addEventListener("click",()=>{
      if(getShift()){openShiftModal();return;}
      // Kort ceremoni før vagten starter — matcher mockuppets "Starting your shift…"
      sc.disabled=true;
      sc.innerHTML='<div class="vd2-act-starting"><div class="vd2-act-spin"></div><span class="vd2-act-starting-lbl">'+(lang==="da"?"Starter vagt…":"Starting your shift…")+'</span></div>';
      haptic(20);
      setTimeout(()=>{startShift();renderVagt();haptic(40);},850);
    });
    if(shift)startVagtTimer(shift);
  }

  $("#counterGrid").addEventListener("click",e=>{
    if(e.target.closest("#addCounterBtn")){openCounterModal(null);return;}
    if(e.target.closest("#addCatBtn")){openNewCatModal();return;}
    if(e.target.closest("#catalogBtn")){openCatalog();return;}
    const catAdd=e.target.closest("[data-cat-add]");if(catAdd){openCounterModal(null,catAdd.dataset.catAdd);return;}
  });

  const stationBack=$("#stationBack");
  if(stationBack){stationBack.textContent=lang==="da"?"‹ Tilbage til Vagt":"‹ Back to Shift";stationBack.addEventListener("click",()=>switchTab("vagt"));}
  let editC=null;
  function openCounterModal(cid,defaultCat){
    editC=cid;const c=cid?state.counters.find(x=>x.id===cid):null;
    $("#counterModalTitle").textContent=c?t("counter_edit"):t("counter_new");
    $("#counterLabelInput").value=c?c.label:"";
    $("#counterDelete").style.display=c?"block":"none";
    const activeUnit=c?c.unit||"stk":"stk";
    document.querySelectorAll(".unit-seg-btn").forEach(b=>{b.classList.toggle("active",b.dataset.unit===activeUnit);});
    $("#counterUnitLbl").textContent=lang==="da"?"Enhed":"Unit";
    const sel=$("#counterCat");sel.innerHTML="";
    // Build category list: user's custom cats + "Andet" fallback
    // If editing a counter with a built-in cat, include that cat too
    const cats=[];
    (state.customCats||[]).forEach(cc=>cats.push({id:cc.id,da:cc.name,en:cc.name}));
    const existingCat=c?(c.cat||"andet"):null;
    if(existingCat&&existingCat!=="andet"&&!cats.some(cc=>cc.id===existingCat)){
      const bi=CATS.find(cat=>cat.id===existingCat);if(bi)cats.push({id:bi.id,da:bi.da,en:bi.en});
    }
    cats.push({id:"andet",da:"Andet",en:"Other"});
    cats.forEach(cat=>{const o=document.createElement("option");o.value=cat.id;o.textContent=lang==="en"?cat.en:cat.da;sel.appendChild(o);});
    const preferred=existingCat||(defaultCat||(state.customCats&&state.customCats.length?state.customCats[0].id:"andet"));
    sel.value=preferred;
    $("#counterScrim").classList.add("open");setTimeout(()=>$("#counterLabelInput").focus(),30);
  }
  function closeCounterModal(){$("#counterScrim").classList.remove("open");editC=null;}
  $("#counterCancel").addEventListener("click",closeCounterModal);
  document.querySelectorAll(".unit-seg-btn").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".unit-seg-btn").forEach(x=>x.classList.remove("active"));b.classList.add("active");}));
  $("#counterSave").addEventListener("click",()=>{
    const v=$("#counterLabelInput").value.trim();if(!v)return;
    const cat=$("#counterCat").value||"andet";
    const unit=document.querySelector(".unit-seg-btn.active")?.dataset.unit||"stk";
    if(editC){const c=state.counters.find(x=>x.id===editC);if(c){c.label=v;c.cat=cat;c.unit=unit;}}
    else {state.counters.push({id:id(),label:v,count:0,unit,subs:[],suggest:seedFor(v),cat});requestLabelTranslation(v);}
    save();renderCounters();closeCounterModal();
  });
  $("#counterDelete").addEventListener("click",()=>{state.counters=state.counters.filter(x=>x.id!==editC);save();renderCounters();renderCareer();closeCounterModal();});
  $("#counterLabelInput").addEventListener("keydown",e=>{if(e.key==="Enter")$("#counterSave").click();});

  // ---- Catalog ----
  function isCatalogActive(presetId){return state.counters.some(c=>c.id===presetId);}
  function openCatalog(){
    renderCatalog("");
    const s=$("#catalogSearch");if(s)s.value="";
    $("#catalogScrim").classList.add("open");
  }
  function closeCatalog(){$("#catalogScrim").classList.remove("open");}
  function makeCatalogCard(item){
    const active=isCatalogActive(item.id);
    const div=document.createElement("div");div.className="catalog-item"+(active?" active":"");
    const badge=active?'<div class="catalog-check">&#10003;</div>':'<div class="catalog-plus">+</div>';
    div.innerHTML=badge+'<div class="catalog-icon">'+item.icon+'</div><div class="catalog-name">'+esc(lang==="en"?item.en:item.da)+'</div>';
    div.addEventListener("click",()=>toggleCatalogItem(item));
    return div;
  }
  function renderCatalog(filter){
    const q=(filter||"").toLowerCase();
    const grid=$("#catalogGrid");if(!grid)return;
    grid.innerHTML="";
    const items=q?CATALOG.filter(it=>it.da.toLowerCase().includes(q)||it.en.toLowerCase().includes(q)):CATALOG;
    if(!items.length){const e=document.createElement("div");e.style.cssText="grid-column:1/-1;padding:40px 0;text-align:center;color:var(--faint);font-size:14px";e.textContent=lang==="da"?"Ingen resultater":"No results";grid.appendChild(e);return;}
    if(q){
      items.forEach(item=>grid.appendChild(makeCatalogCard(item)));
    }else{
      CATS.forEach(cat=>{
        const group=items.filter(it=>it.cat===cat.id);
        if(!group.length)return;
        const hdr=document.createElement("div");
        hdr.style.cssText="grid-column:1/-1;display:flex;align-items:center;gap:8px;margin-top:10px;padding-bottom:6px;border-bottom:1px solid var(--border)";
        hdr.innerHTML='<div style="width:20px;height:20px;color:var(--accent);flex:none">'+cat.icon+'</div><span style="font-size:11px;font-weight:700;color:var(--dim);letter-spacing:.05em;text-transform:uppercase">'+(lang==="en"?cat.en:cat.da)+'</span>';
        grid.appendChild(hdr);
        group.forEach(item=>grid.appendChild(makeCatalogCard(item)));
      });
    }
  }
  function toggleCatalogItem(item){
    if(isCatalogActive(item.id)){
      const c=state.counters.find(x=>x.id===item.id);
      const hasData=c&&(c.count>0||(c.subs||[]).some(s=>s.count>0));
      if(hasData&&!confirm(lang==="da"?"Tælleren har registreringer. Fjern alligevel?":"Counter has data. Remove anyway?"))return;
      state.counters=state.counters.filter(x=>x.id!==item.id);
      save();renderCounters();renderCareer();
      renderCatalog($("#catalogSearch")?.value||"");
    }else{
      const cat=item.cat||guessCategory(item.da);
      state.counters.push({id:item.id,label:lang==="en"?item.en:item.da,count:0,subs:[],suggest:seedFor(lang==="en"?item.en:item.da),cat});
      save();renderCounters();renderCareer();
      closeCatalog();
      showToast((lang==="da"?item.da:item.en)+(lang==="da"?" tilføjet":" added"));
    }
  }
  $("#catalogClose").addEventListener("click",closeCatalog);
  $("#catalogScrim").addEventListener("click",e=>{if(e.target===$("#catalogScrim"))closeCatalog();});
  $("#catalogSearch").addEventListener("input",e=>renderCatalog(e.target.value));

  // ---- Custom categories ----
  function openNewCatModal(){
    $("#newCatInput").value="";
    $("#newCatScrim").classList.add("open");
    setTimeout(()=>$("#newCatInput").focus(),30);
  }
  function closeNewCatModal(){$("#newCatScrim").classList.remove("open");}

  $("#newCatCancel").addEventListener("click",closeNewCatModal);
  $("#newCatScrim").addEventListener("click",e=>{if(e.target===$("#newCatScrim"))closeNewCatModal();});
  $("#newCatSave").addEventListener("click",()=>{
    const name=$("#newCatInput").value.trim();if(!name)return;
    const catId="custom-"+id();
    if(!state.customCats)state.customCats=[];
    state.customCats.push({id:catId,name,icon:"",iconPending:true});
    save();renderCounters();closeNewCatModal();
    generateCatIcon(catId,name);
  });
  $("#newCatInput").addEventListener("keydown",e=>{if(e.key==="Enter")$("#newCatSave").click();});

  function updateCatIconInDom(catId,svg){
    const chip=document.querySelector('[data-chip-cat="'+catId+'"]');
    if(!chip)return;
    const ring=chip.querySelector(".cat-chip-ring");
    if(ring)ring.innerHTML=svg;
  }
  async function generateCatIcon(catId,name){
    const base=apiBase();if(!base)return;
    const token=await getToken();if(!token)return;
    try{
      const res=await fetch(base+"/api/gen-category-icon",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({name})});
      if(!res.ok)return;
      const {svg}=await res.json();
      if(!svg||!svg.startsWith("<svg"))return;
      const cat=(state.customCats||[]).find(c=>c.id===catId);
      if(!cat)return;
      cat.icon=svg;cat.iconPending=false;
      save();
      updateCatIconInDom(catId,svg);
    }catch(e){/* keep dots */}
  }

  // ---- wines ----
  function matchWine(w,q){if(!q)return true;return [w.name,w.producer,w.land,w.region,w.grape,w.vint].some(v=>(v||"").toLowerCase().includes(q));}
  function sumHtml(shown){let g=0,b=0,o=0;shown.forEach(w=>{g+=w.glasses;b+=w.bottles;o+=w.opened||0;});return '<b>'+shown.length+'</b> '+(lang==="en"?(shown.length===1?"wine":"wines"):"vine")+'&nbsp;·&nbsp; <b>'+g+'</b> '+t("glasses").toLowerCase()+'&nbsp;·&nbsp; <b>'+b+'</b> '+t("bottles").toLowerCase()+'&nbsp;·&nbsp; <b>'+o+'</b> '+(lang==="da"?"åbnet":"opened");}
  function makeWRow(w){
    const parts=[];if(w.type&&w.type!=="andet")parts.push(esc(t("wine_type_"+w.type)));[w.producer,w.region,w.land,w.grape].forEach(v=>{if(v)parts.push(esc(v));});
    const metaMid=parts.join('<span class="sep">·</span>');
    const vintHtml=w.vint?'<span class="vint">'+esc(w.vint)+'</span>':'<span class="novint" data-act="edit">'+esc(t("add_vintage"))+'</span>';
    const meta=vintHtml+(parts.length?'<span class="sep">·</span>'+metaMid:'');
    const baseName=w.name||w.producer||w.region||w.grape||(lang==="en"?"Unnamed wine":"Unavngiven vin");
    const disp=baseName+(w.vint?" "+w.vint:"");
    const row=document.createElement("div");row.className="wrow";row.dataset.id=w.id;
    if(w.type&&w.type!=="andet")row.dataset.wtype=w.type;
    const photoHtml=w.imageUrl?'<img class="wrow-photo" src="'+esc(w.imageUrl)+'" alt="" loading="lazy" data-act="photo">':'';
    const lineupTag=w.fromLineup?'<span class="wrow-lineup-tag">lineup</span>':'';
    row.innerHTML=photoHtml+'<div class="winfo" data-act="about"><div class="wname">'+esc(disp)+lineupTag+'</div><div class="wmeta">'+meta+'</div></div>'+
      '<div class="wsteps">'+
      '<div class="wstep-grp"><span class="wstep-grp-lbl">'+(lang==="da"?"Åbnet":"Opened")+'</span>'
        +'<div class="stepblock"><div class="stepctrl"><button class="sbtn" data-act="o-">−</button><span class="tnum" data-k="opened">'+(w.opened||0)+'</span><button class="sbtn plus" data-act="o+">+</button></div></div></div>'+
      '<div class="wstep-div"></div>'+
      '<div class="wstep-grp"><span class="wstep-grp-lbl">'+(lang==="da"?"Drukket":"Drunk")+'</span>'
        +'<div class="wstep-row">'
        +'<div class="stepblock"><div class="steplabel">'+esc(t("glasses"))+'</div><div class="stepctrl"><button class="sbtn" data-act="g-">−</button><span class="tnum" data-k="glasses">'+w.glasses+'</span><button class="sbtn plus" data-act="g+">+</button></div></div>'+
        '<div class="stepblock"><div class="steplabel">'+esc(t("bottles"))+'</div><div class="stepctrl"><button class="sbtn" data-act="b-">−</button><span class="tnum" data-k="bottles">'+w.bottles+'</span><button class="sbtn plus" data-act="b+">+</button></div></div>'
        +'</div></div>'+
      '<button class="wedit" data-act="share" aria-label="Del til feed"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/></svg></button>'
      +'<button class="wedit" data-act="edit">⋯</button></div>';
    const wrap=document.createElement("div");wrap.className="wrow-wrap";
    const del=document.createElement("button");del.className="wrow-del";del.dataset.delId=w.id;
    del.innerHTML='<span class="wrow-del-icon">🗑</span>'+(lang==="da"?"Slet":"Del");
    wrap.appendChild(row);wrap.appendChild(del);
    return wrap;
  }

  const WTYPE_COLORS={rod:["#D97383","rgba(217,115,131,.15)"],hvid:["#E5C368","rgba(229,195,104,.16)"],rose:["#F0A3B8","rgba(240,163,184,.15)"],mousserende:["#7EC8C0","rgba(126,200,192,.15)"],andet:["#9B7EDE","rgba(155,126,222,.15)"]};
  function renderWineStats(){
    const el=$("#wineStats");if(!el)return;
    if(!state.wines.length){el.style.display="none";el.innerHTML="";return;}
    el.style.display="";
    let totalB=0;const CC={},CB={},GC={};
    state.wines.forEach(w=>{
      const b=w.bottles||0;totalB+=b;
      if(w.land){const l=w.land.trim();CC[l]=(CC[l]||0)+1;CB[l]=(CB[l]||0)+b;}
      if(w.grape){const seen=new Set();(w.grape||"").split(",").forEach(g=>{g=g.trim().split(/\//)[0].replace(/\s*\d+\s*%/,"").trim();if(g&&!seen.has(g.toLowerCase())){seen.add(g.toLowerCase());GC[g]=(GC[g]||0)+1;}});}
    });
    const topLand=Object.keys(CC).sort((a,b)=>CC[b]-CC[a])[0];
    const topGrape=Object.keys(GC).sort((a,b)=>GC[b]-GC[a])[0];
    const flag=topLand?(WINE_FLAGS[topLand]||"\ud83c\udf0d"):"";
    const info=getLevelInfo(computeXP());
    const r=52,circ=+(2*Math.PI*r).toFixed(2);
    const arcLen=+(circ*Math.min(1,info.pct/100)).toFixed(2);
    const grapeSvg='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="3"/><circle cx="15" cy="12" r="3"/><circle cx="12" cy="17" r="3"/><path d="M12 9V5l3-3"/></svg>';
    const totalOpened=state.wines.reduce((s2,w)=>s2+(w.opened||0),0);
    // top-5 wines by servings, ring colored by wine type
    const tops=state.wines.map(w=>({w,tot:(w.glasses||0)+(w.bottles||0)})).sort((a,b)=>b.tot-a.tot).slice(0,5);
    const maxTot=Math.max(1,...tops.map(x=>x.tot));
    const mr=25,mc=+(2*Math.PI*mr).toFixed(2);
    const minis='<div class="vd2-minis">'+tops.map(x=>{
      const col=(WTYPE_COLORS[x.w.type]||WTYPE_COLORS.andet)[0];
      const len=+(mc*Math.min(1,x.tot/maxTot)).toFixed(2);
      const nm=x.w.name||x.w.producer||x.w.grape||(lang==="da"?"Uden navn":"Unnamed");
      return '<button class="vd2-mini vd2-mini-tap" data-wine-ring aria-label="'+esc(nm)+': '+fmtNum(x.tot)+'. '+(lang==="da"?"Tryk for overblik":"Tap for overview")+'">'
        +'<div class="vd2-mini-ringwrap">'
          +'<svg class="vd2-mini-svg" viewBox="0 0 60 60"><circle class="vd2-mini-track" cx="30" cy="30" r="'+mr+'"/><circle class="vd2-mini-arc" cx="30" cy="30" r="'+mr+'" stroke="'+col+'" stroke-dasharray="'+len+' '+mc+'"/></svg>'
          +'<span class="vd2-mini-num">'+fmtNum(x.tot)+'</span>'
        +'</div>'
        +'<span class="vd2-mini-lbl">'+esc(nm)+'</span>'
      +'</button>';
    }).join("")
    +'<button class="vd2-mini vd2-mini-all" id="wineRankBtn" aria-label="Achievements">'
      +'<div class="vd2-mini-ringwrap">'
        +'<svg class="vd2-mini-svg" viewBox="0 0 60 60"><circle class="vd2-mini-track dashed" cx="30" cy="30" r="'+mr+'"/></svg>'
        +'<span class="vd2-mini-num" style="font-size:17px">\ud83c\udfc6</span>'
      +'</div>'
      +'<span class="vd2-mini-lbl">'+(lang==="da"?"Rang":"Rank")+'</span>'
    +'</button>'
    +'</div>';
    el.innerHTML='<div class="vd2-hero">'
      +'<div class="vd2-top">'
        +'<button class="vd-ring-wrap vd2-ring-btn" id="wineRingBtn" type="button" aria-label="'+state.wines.length+' '+(lang==="da"?"vine":"wines")+' · '+esc(info.title)+'">'
          +'<svg class="vd-ring-svg" viewBox="0 0 120 120">'
            +'<defs><linearGradient id="vwGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFB36B"/><stop offset="100%" stop-color="#FF6B8A"/></linearGradient></defs>'
            +'<circle class="vd-ring-track" cx="60" cy="60" r="'+r+'"/>'
            +'<circle class="vd-ring-arc" cx="60" cy="60" r="'+r+'" style="stroke:url(#vwGrad)" stroke-dasharray="'+arcLen+' '+circ+'"/>'
          +'</svg>'
          +'<div class="vd-ring-center">'
            +'<span class="vd-ring-num">'+state.wines.length+'</span>'
            +'<span class="vd-ring-lbl">'+(lang==="da"?"vine":"wines")+'</span>'
            +'<span class="vd-ring-goal">'+esc(info.title)+'</span>'
          +'</div>'
        +'</button>'
        +'<div class="vd2-tiles">'
          +(topLand?'<button class="vd2-tile vd2-tile-btn" id="wStatLandTile" type="button"><div class="vd2-tile-ico" style="background:rgba(255,179,107,.16);font-size:17px">'+flag+'</div><div class="vd2-tile-txt"><div class="vd2-tile-val">'+esc(topLand)+'</div><div class="vd2-tile-lbl">'+(lang==="da"?"Top land":"Top country")+'</div></div></button>':'')
          +(topGrape?'<button class="vd2-tile vd2-tile-btn" id="wStatGrapeTile" type="button"><div class="vd2-tile-ico" style="background:rgba(126,200,192,.16);color:#7EC8C0">'+grapeSvg+'</div><div class="vd2-tile-txt"><div class="vd2-tile-val">'+esc(topGrape)+'</div><div class="vd2-tile-lbl">'+(lang==="da"?"Top drue":"Top grape")+'</div></div></button>':'')
        +'</div>'
      +'</div>'
      +(totalOpened>0?'<div class="vd2-caption" style="text-align:center">'+fmtNum(totalOpened)+' '+(lang==="da"?"flasker \u00e5bnet i alt":"bottles opened total")+'</div>':'')
      +minis
    +'</div>';
    const ringBtn=document.getElementById("wineRingBtn");if(ringBtn)ringBtn.addEventListener("click",openAchievements);
    const rankBtn=document.getElementById("wineRankBtn");if(rankBtn)rankBtn.addEventListener("click",openAchievements);
    el.querySelectorAll("[data-wine-ring]").forEach(b=>b.addEventListener("click",()=>{openWineOverview();haptic(15);}));
    function openStatsModal(title,html){
      const modal=document.getElementById("wStatsModal");
      const listEl=document.getElementById("wStatsList");
      const titleEl=document.getElementById("wStatsTitle");
      if(!modal||!listEl||!titleEl)return;
      titleEl.textContent=title;listEl.innerHTML=html;
      modal.style.display="flex";
      modal.onclick=e=>{if(e.target===modal)modal.style.display="none";};
      document.getElementById("wStatsClose").onclick=()=>modal.style.display="none";
    }
    const landTile=document.getElementById("wStatLandTile");
    if(landTile)landTile.addEventListener("click",()=>{
      const sorted=Object.keys(CC).sort((a,b)=>CC[b]-CC[a]);
      const total=state.wines.length||1;const max=CC[sorted[0]]||1;
      openStatsModal(lang==="da"?"Lande":"Countries",sorted.map(k=>{
        const pct=Math.round(CC[k]/total*100);
        const fl=WINE_FLAGS[k]||"";const bott=CB[k]||0;
        const bottStr=bott>0?" · "+bott+(lang==="da"?" fl.":" btl."):"";
        return '<div class="wstat-row">'
          +'<div class="wstat-top"><span class="wstat-name">'+(fl?fl+" ":"")+esc(k)+"</span>"
          +'<span class="wstat-nums">'+pct+"%"+bottStr+"</span></div>"
          +'<div class="wstat-bar-wrap"><div class="wstat-bar" style="width:'+pct+'%"></div></div>'
          +'</div>';
      }).join(""));
    });
    const grapeTile=document.getElementById("wStatGrapeTile");
    if(grapeTile)grapeTile.addEventListener("click",()=>{
      const sorted=Object.keys(GC).sort((a,b)=>GC[b]-GC[a]);
      const total=state.wines.length||1;const max=GC[sorted[0]]||1;
      openStatsModal(lang==="da"?"Druer":"Grapes",sorted.map(k=>{
        const pct=Math.round(GC[k]/total*100);
        return '<div class="wstat-row">'
          +'<div class="wstat-top"><span class="wstat-name">'+esc(k)+'</span>'
          +'<span class="wstat-nums">'+pct+'%</span></div>'
          +'<div class="wstat-bar-wrap"><div class="wstat-bar" style="width:'+pct+'%"></div></div>'
          +'</div>';
      }).join(""));
    });
  }
  function renderWineTypeStrip(){
    const strip=$("#wineTypeStrip");if(!strip)return;
    const counts={};
    state.wines.forEach(w=>{const tp=w.type||"andet";counts[tp]=(counts[tp]||0)+1;});
    const lineupCount=state.wines.filter(w=>w.fromLineup).length;
    const order=["alle","rod","hvid","rose","mousserende","andet","lineup"];
    strip.innerHTML="";
    order.forEach(type=>{
      if(type==="lineup"){if(!lineupCount)return;}
      else if(type!=="alle"&&!counts[type])return;
      const count=type==="alle"?state.wines.length:type==="lineup"?lineupCount:(counts[type]||0);
      const btn=document.createElement("button");btn.className="wtype-strip-btn"+(activeWineType===type?" active":"");btn.dataset.wtype=type;
      const dotHtml=type!=="alle"&&type!=="lineup"?'<span class="wtype-dot wtype-dot-'+type+'"></span>':'';
      const lbl=type==="alle"?t("wine_alle"):type==="lineup"?(lang==="da"?"Lineup":"Lineup"):t("wine_type_"+type);
      btn.innerHTML=dotHtml+esc(lbl)+'<span class="wtype-count"> '+count+'</span>';
      btn.addEventListener("click",()=>{activeWineType=type;localStorage.setItem("mise_wine_type",type);renderWines();});
      strip.appendChild(btn);
    });
  }

  function renderWines(){
    // Auto-migrate: guess type for wines without one
    let migrated=false;
    state.wines.forEach(w=>{if(!w.type){w.type=guessWineType(w);migrated=true;}});
    if(migrated)save();

    renderWineStats();
    renderWineTypeStrip();
    renderLevelBar();

    const q=wineFilter.trim().toLowerCase();
    const list=$("#wineList");list.innerHTML="";

    const typeFiltered=activeWineType==="alle"?state.wines:activeWineType==="lineup"?state.wines.filter(w=>w.fromLineup):state.wines.filter(w=>(w.type||"andet")===activeWineType);
    const shown=typeFiltered.filter(w=>matchWine(w,q));
    $("#wineSum").innerHTML=sumHtml(shown);

    if(!shown.length){
      if(!state.wines.length){
        list.innerHTML='<div class="empty-state"><div class="empty-state-icon">🍷</div><div class="empty-state-title">'+(lang==="da"?"Kælderen er tom":"The cellar is empty")+'</div><div class="empty-state-sub">'+(lang==="da"?"Søg efter en vin foroven, eller tilføj manuelt":"Search for a wine above, or add one manually")+'</div><button class="btn primary" style="margin-top:16px" data-act="add-wine">'+(lang==="da"?"+ Tilføj din første vin":"+ Add your first wine")+'</button></div>';
      } else {
        list.innerHTML='<div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-title">'+(lang==="da"?"Ingen vine matcher":"No wines match")+'</div><div class="empty-state-sub">'+esc(t("wine_no_q"))+'</div></div>';
      }
      return;
    }

    // Group by country
    const groups={},noCountry=[];
    shown.forEach(w=>{const land=wLand(w);if(land){if(!groups[land])groups[land]=[];groups[land].push(w);}else noCountry.push(w);});
    const sortedLands=Object.keys(groups).sort((a,b)=>groups[b].length-groups[a].length);

    const multiGroup=sortedLands.length+(noCountry.length?1:0)>1;
    function renderCountryGroup(land,wines,startOpen){
      const head=document.createElement("div");
      const flag=WINE_FLAGS[land]||"🍷";
      const isOpen=!multiGroup||startOpen;
      head.className="wine-country-head"+(isOpen?" wch-open":"");
      head.innerHTML='<span class="wine-country-flag">'+flag+'</span><span class="wine-country-name">'+esc(land)+'</span><span class="wine-country-count">'+wines.length+'</span><span class="wine-country-chev">›</span>';
      list.appendChild(head);
      const grp=document.createElement("div");grp.className="winelist-group"+(isOpen?"":" wch-hidden");
      wines.forEach(w=>grp.appendChild(makeWRow(w)));
      list.appendChild(grp);
      if(multiGroup)head.addEventListener("click",()=>{const open=head.classList.toggle("wch-open");grp.classList.toggle("wch-hidden",!open);});
    }

    sortedLands.forEach((land,i)=>renderCountryGroup(land,groups[land],i===0));
    if(noCountry.length)renderCountryGroup(t("wine_no_country"),noCountry,!sortedLands.length);
  }
  $("#wineList").addEventListener("click",e=>{
    if(e.target.closest("[data-act='add-wine']")){openWineSheet(null,"edit");return;}
    const del=e.target.closest(".wrow-del");
    if(del){undoSnapshot=clone(state);state.wines=state.wines.filter(x=>x.id!==del.dataset.delId);save();renderWines();renderCareer();showToast(lang==="da"?"Vin slettet":"Wine deleted");return;}
    const row=e.target.closest(".wrow");if(!row)return;
    const act=e.target.closest("[data-act]");if(!act)return;
    const w=state.wines.find(x=>x.id===row.dataset.id);if(!w)return;
    const a=act.dataset.act;
    if(a==="about"){openWineSheet(w,"view");return;}
    if(a==="photo"){openWineSheet(w,"view");return;}
    if(a==="edit"){openWineSheet(w,"edit");return;}
    if(a==="share"){openWineShareSheet(w);return;}
    let key,d;if(a==="g+"){key="glasses";d=1;}else if(a==="g-"){key="glasses";d=-1;}else if(a==="b+"){key="bottles";d=1;}else if(a==="b-"){key="bottles";d=-1;}else if(a==="o+"){key="opened";d=1;}else if(a==="o-"){key="opened";d=-1;}else return;
    w[key]=Math.max(0,(w[key]||0)+d);
    const n=row.querySelector('.tnum[data-k="'+key+'"]');n.textContent=w[key];if(d>0)tickEl(n);
    $("#wineSum").innerHTML=sumHtml(state.wines.filter(x=>matchWine(x,wineFilter.trim().toLowerCase())));
    renderCareer();save();
  });

  // ── Del vin til feed ──
  let _wineShareWine=null,_wineShareFinalPhoto=null;
  function _setWineSharePhotoUi(url){
    const prev=$("#wineSharePhotoPreview"),rm=$("#wineSharePhotoRemove"),btn=$("#wineSharePhotoBtn");
    if(url){prev.src=url;prev.style.display="";rm.style.display="";rm.textContent=lang==="da"?"Fjern billede":"Remove photo";btn.textContent=lang==="da"?"Skift billede":"Change photo";}
    else{prev.style.display="none";rm.style.display="none";btn.textContent=lang==="da"?"+ Billede":"+ Photo";}
  }
  function openWineShareSheet(w){
    _wineShareWine=w;_wineShareFinalPhoto=w.imageUrl||null;
    const parts=[w.producer,w.region,w.land,w.vint].filter(Boolean);
    $("#wineShareTitle").textContent=lang==="da"?"Del til feed":"Share to feed";
    $("#wineShareSub").textContent=(w.name||w.producer||(lang==="da"?"Uden navn":"Unnamed"))+(parts.length?" — "+parts.join(" · "):"");
    $("#wineShareCaptionLbl").textContent=lang==="da"?"Kommentar (valgfri)":"Caption (optional)";
    $("#wineShareCaption").value="";
    $("#wineShareSend").textContent=lang==="da"?"Del":"Share";
    $("#wineShareCancel").textContent=lang==="da"?"Annuller":"Cancel";
    _setWineSharePhotoUi(_wineShareFinalPhoto);
    $("#wineShareScrim").classList.add("open");
  }
  function closeWineShareSheet(){$("#wineShareScrim").classList.remove("open");_wineShareWine=null;_wineShareFinalPhoto=null;}
  $("#wineSharePhotoBtn").addEventListener("click",()=>$("#wineSharePhotoInput").click());
  $("#wineSharePhotoInput").addEventListener("change",async()=>{
    const inp=$("#wineSharePhotoInput");const file=inp.files[0];if(!file)return;
    const url=await resizeImage(file,1200);
    _wineShareFinalPhoto=url;_setWineSharePhotoUi(url);
    inp.value="";
  });
  $("#wineSharePhotoRemove").addEventListener("click",()=>{_wineShareFinalPhoto=null;_setWineSharePhotoUi(null);});
  $("#wineShareCancel").addEventListener("click",closeWineShareSheet);
  $("#wineShareScrim").addEventListener("click",e=>{if(e.target===$("#wineShareScrim"))closeWineShareSheet();});
  $("#wineShareSend").addEventListener("click",async()=>{
    if(!_wineShareWine)return;
    const w=_wineShareWine;
    const btn=$("#wineShareSend");
    const base=apiBase();const token=await getToken();
    if(!base||!token){showToast(lang==="da"?"Ingen forbindelse — prøv igen":"No connection — try again");return;}
    btn.disabled=true;
    try{
      let imageUrl=null;
      if(_wineShareFinalPhoto){
        if(_wineShareFinalPhoto.startsWith("data:")){
          const upRes=await fetch(base+"/api/upload-photo",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({dataUrl:_wineShareFinalPhoto})});
          const upD=await upRes.json();
          imageUrl=upD.url||null;
        }else{imageUrl=_wineShareFinalPhoto;}
      }
      const parts=[w.producer,w.region,w.land,w.vint].filter(Boolean);
      const caption=($("#wineShareCaption").value||"").trim();
      const summary=(caption||parts.join(" · ")).slice(0,200);
      const wineName=w.name||w.producer||(lang==="da"?"Vin":"Wine");
      const r=await fetch(base+"/api/log-entry",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({categoryLabel:wineName,delta:1,imageUrl,summary})});
      if(!r.ok){showToast(lang==="da"?"Kunne ikke dele — prøv igen":"Couldn't share — try again");btn.disabled=false;return;}
      haptic(40);showToast(lang==="da"?"Delt til dit feed 🍷":"Shared to your feed 🍷");
      closeWineShareSheet();
      {const fv=document.getElementById("view-feed");if(fv&&fv.classList.contains("active"))loadFeed(false);}
    }catch(e){
      showToast(lang==="da"?"Ingen forbindelse — prøv igen":"No connection — try again");
    }
    btn.disabled=false;
  });

  // Swipe-to-delete on wine cards
  let _swX=0,_swY=0,_swRow=null;
  document.addEventListener("touchstart",e=>{
    const wrap=e.target.closest(".wrow-wrap");
    if(wrap&&wrap.closest("#wineList")){_swRow=wrap.querySelector(".wrow");_swX=e.touches[0].clientX;_swY=e.touches[0].clientY;}
    else if(!e.target.closest(".wrow-del")){document.querySelectorAll("#wineList .wrow.swiped").forEach(r=>r.classList.remove("swiped"));}
  },{passive:true});
  document.addEventListener("touchmove",e=>{
    if(!_swRow)return;
    if(Math.abs(e.touches[0].clientY-_swY)>Math.abs(e.touches[0].clientX-_swX)+8)_swRow=null;
  },{passive:true});
  document.addEventListener("touchend",e=>{
    if(!_swRow)return;
    const dx=e.changedTouches[0].clientX-_swX;
    if(dx<-48)_swRow.classList.add("swiped");else if(dx>16)_swRow.classList.remove("swiped");
    _swRow=null;
  },{passive:true});

  $("#wineSearch").addEventListener("input",e=>{wineFilter=e.target.value;renderWines();});

  // ---- Wine sheet (view + edit) ----
  let _waWineId=null,_waPhotoDataUrl=null,_waPhotoExistingUrl=null,_waFromScan=false;

  function _waSetPhotoPreview(src){
    const prev=document.getElementById("waPhotoPreview"),rm=document.getElementById("waPhotoRemove"),btn=document.getElementById("waPhotoBtn");
    if(!prev||!rm||!btn)return;
    if(src){prev.src=src;prev.style.display="block";rm.style.display="";btn.textContent=lang==="da"?"Skift billede":"Change photo";}
    else{prev.src="";prev.style.display="none";rm.style.display="none";btn.textContent=lang==="da"?"+ Billede":"+ Photo";}
  }

  const _waboutSVGS={
    land:'<svg class="wabout-cell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    region:'<svg class="wabout-cell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7-6.2-7-10.5A7 7 0 0 1 19 10.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    vint:'<svg class="wabout-cell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    type:'<svg class="wabout-cell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 2h8l1 8c0 4-2.5 7-5 8-2.5-1-5-4-5-8z"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>',
    grape:'<svg class="wabout-cell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="12" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="9" cy="17" r="2"/><circle cx="15" cy="17" r="2"/><circle cx="12" cy="20" r="2"/><path d="M12 10V6"/><path d="M9 6c0-2 6-3 6 0"/></svg>',
    count:'<svg class="wabout-cell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    opened:'<svg class="wabout-cell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 2h6v5l2 3v9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-9l2-3V2z"/><path d="M7 14h10"/><path d="M10 9l2 2 2-2" stroke-width="1.5"/></svg>'
  };

  function _waShowView(w){
    const viewEl=document.getElementById("wAboutView"),editEl=document.getElementById("wAboutEdit");
    const editBtn=document.getElementById("wAboutEditBtn"),hTitle=document.getElementById("wAboutHeaderTitle");
    const shareBtn=document.getElementById("wAboutShareBtn");
    const backBtn=document.getElementById("wAboutBackBtn");
    if(backBtn)backBtn.style.display="none";
    if(viewEl)viewEl.style.display="";if(editEl)editEl.style.display="none";
    if(editBtn){editBtn.style.display="";editBtn.textContent=lang==="da"?"✏ Rediger":"✏ Edit";}
    if(!w){if(hTitle)hTitle.textContent="";if(shareBtn)shareBtn.style.display="none";return;}
    if(shareBtn)shareBtn.style.display="";
    const dispName=w.name+(w.vint?" "+w.vint:"");
    if(hTitle)hTitle.textContent=dispName;
    const titleEl=document.getElementById("wAboutTitle");if(titleEl)titleEl.textContent=dispName;
    const prodEl=document.getElementById("wAboutProducer");if(prodEl)prodEl.textContent=w.producer||"";
    const gridEl=document.getElementById("wAboutGrid");
    const _wtypeLabel={rod:"Rød",hvid:"Hvid",rose:"Rosé",mousserende:"Mousserende",andet:"Andet"};
    const cells=[];
    if(w.land)cells.push({icon:_waboutSVGS.land,label:lang==="da"?"Land":"Country",value:w.land});
    if(w.region)cells.push({icon:_waboutSVGS.region,label:lang==="da"?"Region":"Region",value:w.region});
    if(w.vint)cells.push({icon:_waboutSVGS.vint,label:lang==="da"?"Årgang":"Vintage",value:w.vint});
    if(w.type&&w.type!=="andet")cells.push({icon:_waboutSVGS.type,label:lang==="da"?"Type":"Type",value:_wtypeLabel[w.type]||w.type});
    if(w.grape)cells.push({icon:_waboutSVGS.grape,label:lang==="da"?"Drue":"Grape",value:w.grape});
    if(w.imageUrl)cells.push({photo:w.imageUrl});
    if((w.opened||0)>0)cells.push({icon:_waboutSVGS.opened,label:lang==="da"?"Åbnet":"Opened",value:fmtNum(w.opened)+" "+(lang==="da"?"fl.":"btl.")});
    const totG=(w.glasses||0)+(w.bottles||0)*6;
    if(totG>0)cells.push({icon:_waboutSVGS.count,label:lang==="da"?"Drukket":"Drunk",value:totG+((w.bottles||0)>0?" ("+w.bottles+" fl.)":"")});
    if(gridEl)gridEl.innerHTML=cells.map(c=>c.photo?`<div class="wabout-cell wabout-cell-photo"><img src="${esc(c.photo)}" class="wabout-photo-img" alt=""></div>`:`<div class="wabout-cell">${c.icon}<div class="wabout-cell-label">${esc(c.label)}</div><div class="wabout-cell-value">${esc(c.value)}</div></div>`).join("");
    const divEl=document.getElementById("wAboutDivider");if(divEl)divEl.style.display="";
    const bodyEl=document.getElementById("wAboutBody");
    if(bodyEl){bodyEl.style.display="";if(w.about){bodyEl.textContent=w.about;bodyEl.style.color="var(--dim)";}else{bodyEl.textContent=lang==="da"?"Ingen beskrivelse endnu.":"No description yet.";bodyEl.style.color="var(--faint)";}}
  }

  function _waGrapeUpdateRm(){
    const rows=document.querySelectorAll("#waGrapeList .wa-grape-row");
    rows.forEach(r=>{r.querySelector(".wa-grape-rm").style.display=rows.length>1?"":"none";});
  }
  function _waAddGrapeRow(val){
    const container=document.getElementById("waGrapeList");if(!container)return;
    const row=document.createElement("div");row.className="wa-grape-row";
    const inp=document.createElement("input");inp.className="wa-input wa-grape-input";inp.maxLength=80;inp.autocomplete="off";
    inp.placeholder=lang==="da"?"Druésort...":"Grape variety...";inp.value=val||"";
    const rm=document.createElement("button");rm.type="button";rm.className="wa-grape-rm";rm.textContent="×";
    rm.addEventListener("click",()=>{row.remove();_waGrapeUpdateRm();});
    row.append(inp,rm);container.appendChild(row);
    attachAC(inp,()=>wineSuggest("grape"));
    _waGrapeUpdateRm();
  }
  function _waSetGrapes(list){
    const container=document.getElementById("waGrapeList");if(!container)return;
    container.innerHTML="";
    (list&&list.length?list:[""]).forEach(g=>_waAddGrapeRow(g));
  }

  function _waEnterEdit(w){
    const viewEl=document.getElementById("wAboutView"),editEl=document.getElementById("wAboutEdit");
    const editBtn=document.getElementById("wAboutEditBtn"),hTitle=document.getElementById("wAboutHeaderTitle");
    const shareBtn2=document.getElementById("wAboutShareBtn");
    if(viewEl)viewEl.style.display="none";if(editEl)editEl.style.display="";
    if(editBtn)editBtn.style.display="none";
    if(shareBtn2)shareBtn2.style.display="none";
    if(hTitle)hTitle.textContent=w?(lang==="da"?"Rediger vin":"Edit wine"):(lang==="da"?"Tilføj vin":"Add wine");
    _waPhotoDataUrl=null;_waPhotoExistingUrl=w?w.imageUrl||null:null;_waSetPhotoPreview(_waPhotoExistingUrl);
    const fields={waName:w?w.name:"",waProducer:w?w.producer:"",waLand:w?w.land:"",waRegion:w?w.region:"",waVint:w?w.vint:"",waAbout:w?w.about||"":""};
    Object.keys(fields).forEach(id=>{const el=document.getElementById(id);if(el)el.value=fields[id];});
    _waSetGrapes(w&&w.grape?(w.grape.split(",").map(s=>s.trim()).filter(Boolean)):[]);
    const wtype=(w&&w.type)||"andet";
    document.querySelectorAll(".wa-type-btn").forEach(b=>b.classList.toggle("active",b.dataset.wtype===wtype));
    const pi=document.getElementById("waPhotoInput");if(pi)pi.value="";
    const delBtn=document.getElementById("waDelete");if(delBtn)delBtn.style.display=w?"":"none";
    setTimeout(()=>{const el=document.getElementById("waName");if(el)el.focus();},30);
  }

  function openWineSheet(wine,mode){
    const w=(wine&&typeof wine==="object")?wine:(wine?state.wines.find(x=>x.id===wine):null);
    _waWineId=w?w.id:null;
    const modal=document.getElementById("wAboutModal");if(!modal)return;
    if(mode==="edit")_waEnterEdit(w);else _waShowView(w);
    modal.style.display="flex";
    const closeBtn=document.getElementById("wAboutClose");if(closeBtn)closeBtn.onclick=closeWineSheet;
    modal.onclick=function(e){if(e.target===modal)closeWineSheet();};
  }
  function closeWineSheet(){
    const modal=document.getElementById("wAboutModal");if(modal)modal.style.display="none";
    _waWineId=null;_waPhotoDataUrl=null;_waPhotoExistingUrl=null;_waFromScan=false;
  }

  function openPostModal(w){
    const modal=document.getElementById("wPostModal");
    const titleEl=document.getElementById("wPostTitle");
    const caption=document.getElementById("wPostCaption");
    if(!modal||!titleEl||!caption)return;
    titleEl.textContent=w.name+(w.vint?" "+w.vint:"");
    caption.value="";
    modal.style.display="flex";
    setTimeout(()=>caption.focus(),80);
    modal.onclick=e=>{if(e.target===modal)modal.style.display="none";};
    document.getElementById("wPostClose").onclick=()=>modal.style.display="none";
    document.getElementById("wPostCancel").onclick=()=>modal.style.display="none";
    document.getElementById("wPostConfirm").onclick=async()=>{
      const text=caption.value.trim();
      modal.style.display="none";
      const base=apiBase();const token=await getToken();
      if(!base||!token){showToast(lang==="da"?"Log ind for at dele":"Log in to share");return;}
      const dispName=w.name+(w.vint?" "+w.vint:"");
      const parts=[w.producer,w.region,w.land].filter(Boolean);
      const autoSummary=dispName+(parts.length?" · "+parts[0]:"");
      const summary=text||autoSummary;
      try{
        const r=await fetch(base+"/api/log-entry",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({categoryLabel:dispName,delta:1,imageUrl:w.imageUrl||null,summary})});
        if(r.ok)showToast(lang==="da"?"Postet til feed!":"Posted to feed!");
        else showToast(lang==="da"?"Fejl ved post":"Post failed");
      }catch(e){showToast(lang==="da"?"Fejl ved post":"Post failed");}
    };
  }

  document.getElementById("wAboutShareBtn").addEventListener("click",()=>{
    const w=_waWineId?state.wines.find(x=>x.id===_waWineId):null;
    if(w)openPostModal(w);
  });

  (function(){
    const lb=document.getElementById("wPhotoLightbox");
    const lbImg=document.getElementById("wPhotoLbImg");
    const lbClose=document.getElementById("wPhotoLbClose");
    if(!lb||!lbImg||!lbClose)return;
    function openLb(src){lbImg.src=src;lb.style.display="flex";}
    function closeLb(){lb.style.display="none";lbImg.src="";}
    lbClose.addEventListener("click",closeLb);
    lb.addEventListener("click",e=>{if(!e.target.closest("#wPhotoLbImg"))closeLb();});
    document.getElementById("wAboutGrid").addEventListener("click",e=>{
      const img=e.target.closest(".wabout-photo-img");
      if(img)openLb(img.src);
    });
  })();

  async function doWineLabelScan(file,openFirst){
    track("wine_scan");
    if(!file)return;
    const base=apiBase();const token=await getToken();if(!base||!token){showToast(t("wine_scan_err"));return;}
    const btns=[document.getElementById("waScanBtn"),document.getElementById("winePageScanBtn")];
    const lbls=[document.getElementById("waScanLbl"),document.getElementById("winePageScanLbl")];
    btns.forEach(b=>{if(b)b.classList.add("loading");});
    lbls.forEach(l=>{if(l)l.textContent=t("wine_scan_loading");});
    try{
      const dataUrl=await resizeImage(file,1400);if(!dataUrl)throw new Error("image-fail");
      const r=await fetch(base+"/api/visits/wine-from-label",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({dataUrl,lang})});
      const d=await r.json();if(!r.ok||(!d.name&&!d.producer))throw new Error(d.error||"empty");
      // Overblikket først: upload foto, gem vinen, vis det flotte view — Rediger udfylder resten
      let imageUrl=null;
      try{
        const ur=await fetch(base+"/api/upload-photo",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({dataUrl})});
        const ud=await ur.json();imageUrl=ud.url||null;
      }catch(e){}
      const data={name:d.name||"",producer:d.producer||"",land:d.land||"",region:d.region||"",grape:d.grape||"",vint:d.vintage||"",imageUrl,type:d.type||"andet",about:d.about||"",glasses:0,bottles:0,opened:1};
      _waWineId=null;_waFromScan=false;
      const match=state.wines.find(w=>wineSimilar({name:data.name,producer:data.producer},w));
      if(match){
        _pendingWineData=Object.assign(data,{_match:match});
        const dn=match.name||(match.producer+(match.vint?" "+match.vint:""))||"ukendt vin";
        document.getElementById("wineDupTitle").textContent=lang==="da"?"Kender vi den her?":"Know this one?";
        document.getElementById("wineDupBody").textContent=(lang==="da"?"Ligner det ikke ":"Looks like ")+('"'+dn+'"')+(lang==="da"?"? Du kan tilføje til den i stedet for at oprette en kopi.":" you already have? Add to it instead of creating a duplicate.");
        document.getElementById("wineDupMerge").textContent=lang==="da"?"Ja, tilføj til den":"Yes, add to it";
        document.getElementById("wineDupNew").textContent=lang==="da"?"Nej, opret ny":"No, create new";
        document.getElementById("wineDupScrim").classList.add("open");
      }else{
        doWineCommit(data,null);
      }
    }catch(e){showToast(t("wine_scan_err"));}
    finally{btns.forEach(b=>{if(b)b.classList.remove("loading");});lbls.forEach(l=>{if(l)l.textContent=t("wine_scan");});}
  }

  document.getElementById("wAboutEditBtn").addEventListener("click",()=>{const w=_waWineId?state.wines.find(x=>x.id===_waWineId):null;_waEnterEdit(w);});
  document.getElementById("waCancel").addEventListener("click",()=>{const w=_waWineId?state.wines.find(x=>x.id===_waWineId):null;if(w)_waShowView(w);else closeWineSheet();});
  document.getElementById("waSave").addEventListener("click",async()=>{
    const gv=id=>(document.getElementById(id)||{}).value||"";
    const name=gv("waName").trim(),producer=gv("waProducer").trim(),land=gv("waLand").trim(),region=gv("waRegion").trim(),vint=gv("waVint").trim(),about=gv("waAbout").trim();
    const grape=[...document.querySelectorAll("#waGrapeList .wa-grape-input")].map(i=>i.value.trim()).filter(Boolean).join(", ");
    if(!name&&!producer&&!region&&!grape)return;
    let imageUrl=_waPhotoExistingUrl||null;
    if(_waPhotoDataUrl){const base=apiBase();const token=await getToken();if(base&&token){try{const r=await fetch(base+"/api/upload-photo",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({dataUrl:_waPhotoDataUrl})});const d=await r.json();if(d.url)imageUrl=d.url;}catch(e){}}}
    const type=(document.querySelector(".wa-type-btn.active")||{}).dataset?.wtype||"andet";
    const fromScan=_waFromScan;_waFromScan=false;
    const data={name,producer,land,region,grape,vint,imageUrl,type,about,glasses:0,bottles:0,opened:fromScan?1:0};
    if(!_waWineId){
      const match=state.wines.find(w=>wineSimilar({name,producer},w));
      if(match){
        _pendingWineData=Object.assign(data,{_match:match});
        const dn=match.name||(match.producer+(match.vint?" "+match.vint:""))||"ukendt vin";
        document.getElementById("wineDupTitle").textContent=lang==="da"?"Kender vi den her?":"Know this one?";
        document.getElementById("wineDupBody").textContent=(lang==="da"?"Ligner det ikke ":"Looks like ")+('"'+dn+'"')+(lang==="da"?"? Du kan tilføje til den i stedet for at oprette en kopi.":" you already have? Add to it instead of creating a duplicate.");
        document.getElementById("wineDupMerge").textContent=lang==="da"?"Ja, tilføj til den":"Yes, add to it";
        document.getElementById("wineDupNew").textContent=lang==="da"?"Nej, opret ny":"No, create new";
        document.getElementById("wineDupScrim").classList.add("open");return;
      }
    }
    doWineCommit(data,null);
  });
  document.getElementById("waDelete").addEventListener("click",()=>{if(!_waWineId)return;state.wines=state.wines.filter(x=>x.id!==_waWineId);save();renderWines();renderCareer();closeWineSheet();});
  document.getElementById("waGrapeAdd").addEventListener("click",()=>_waAddGrapeRow(""));
  document.getElementById("waPhotoBtn").addEventListener("click",()=>document.getElementById("waPhotoInput").click());
  document.getElementById("waPhotoInput").addEventListener("change",async()=>{const f=document.getElementById("waPhotoInput").files[0];if(!f)return;const u=await resizeImage(f,1200);_waPhotoDataUrl=u;_waPhotoExistingUrl=null;_waSetPhotoPreview(u);});
  document.getElementById("waPhotoRemove").addEventListener("click",()=>{_waPhotoDataUrl=null;_waPhotoExistingUrl=null;_waSetPhotoPreview(null);document.getElementById("waPhotoInput").value="";});
  document.querySelectorAll(".wa-type-btn").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".wa-type-btn").forEach(x=>x.classList.remove("active"));b.classList.add("active");}));
  const waScanBtn=document.getElementById("waScanBtn");const waScanInput=document.getElementById("waScanInput");
  if(waScanBtn&&waScanInput){waScanBtn.addEventListener("click",()=>waScanInput.click());waScanInput.addEventListener("change",()=>{const f=waScanInput.files[0];waScanInput.value="";if(f)doWineLabelScan(f,false);});}
  const winePageScanBtn=document.getElementById("winePageScanBtn");const winePageScanInput=document.getElementById("winePageScanInput");
  if(winePageScanBtn&&winePageScanInput){
    winePageScanBtn.addEventListener("click",()=>winePageScanInput.click());
    winePageScanInput.addEventListener("change",()=>{const f=winePageScanInput.files[0];winePageScanInput.value="";if(f)doWineLabelScan(f,true);});
  }

  let lineupWines=[],_lineupImageUrl=null;
  function openLineupWineView(w){
    const scrim=document.getElementById("lineupScrim");if(scrim)scrim.style.display="none";
    const wine={id:id(),name:w.name||"",producer:w.producer||"",vint:w.vint||w.vintage||"",type:w.type||"andet",land:w.land||"",region:w.region||"",grape:w.grape||"",glasses:0,bottles:0,opened:1,imageUrl:_lineupImageUrl||null,about:w.about||"",fromLineup:true};
    state.wines.push(wine);save();renderWines();
    openWineSheet(wine,"view");
    const backBtn=document.getElementById("wAboutBackBtn");
    if(backBtn){
      backBtn.style.display="";
      backBtn.onclick=()=>{closeWineSheet();const s=document.getElementById("lineupScrim");if(s)s.style.display="flex";};
    }
  }
  function renderLineupModal(wines){
    lineupWines=wines||[];
    const list=$("#lineupList");if(!list)return;
    const readable=lineupWines.filter(w=>w.readable!==false);
    const unreadable=lineupWines.filter(w=>w.readable===false);
    const sub=$("#lineupSub");
    if(sub){const fn=t("lineup_sub_fn");sub.textContent=fn.replace("{0}",readable.length).replace("{1}",unreadable.length);}
    const typeColors={"rod":"#C0392B","hvid":"#D4AC0D","rose":"#E08080","champagne":"#C9A465","mousserende":"#C9A465","andet":"#888"};
    list.innerHTML="";
    lineupWines.forEach((w,i)=>{
      const unread=w.readable===false;
      const color=typeColors[w.type]||"#888";
      const item=document.createElement("div");
      item.className="lineup-item"+(unread?" unreadable":"");
      item.innerHTML=`<div class="lineup-item-dot" style="background:${color}"></div>`
        +`<div class="lineup-item-body">`
        +`<div class="lineup-item-name">${esc(w.name||w.producer||"—")}</div>`
        +(w.producer&&w.name?`<div class="lineup-item-meta">${esc(w.producer)}${w.vintage?" · "+esc(w.vintage):""}</div>`:(w.vintage?`<div class="lineup-item-meta">${esc(w.vintage)}</div>`:""))
        +(w.region||w.land?`<div class="lineup-item-meta">${esc([w.region,w.land].filter(Boolean).join(", "))}</div>`:"")
        +(w.grape?`<div class="lineup-item-grape">${esc(w.grape)}</div>`:"")
        +(unread?`<div class="lineup-item-warn">${t("lineup_unreadable")}</div>`:"")
        +`</div><span class="lineup-item-arrow">›</span>`;
      if(!unread)item.addEventListener("click",()=>openLineupWineView(w));
      list.appendChild(item);
    });
    const scrim=$("#lineupScrim");if(scrim){scrim.style.display="flex";scrim.onclick=e=>{if(e.target===scrim)scrim.style.display="none";};}
  }
  async function doLineupScan(file){
    if(!file)return;
    const base=apiBase();const token=await getToken();if(!base||!token){showToast(t("wine_lineup_err"));return;}
    const btn=$("#wineLineupBtn");const lbl=$("#wineLineupLbl");
    if(btn)btn.classList.add("loading");if(lbl)lbl.textContent=t("wine_lineup_loading");
    try{
      const dataUrl=await resizeImage(file,1600);
      if(!dataUrl)throw new Error("image-fail");
      const r=await fetch(base+"/api/visits/wine-lineup",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({dataUrl,lang})});
      const d=await r.json();
      if(!r.ok||!Array.isArray(d.wines))throw new Error(d.error||"empty");
      _lineupImageUrl=null;
      try{const ur=await fetch(base+"/api/upload-photo",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({dataUrl})});const ud=await ur.json();if(ud.url)_lineupImageUrl=ud.url;}catch(e){}
      renderLineupModal(d.wines);
    }catch(e){showToast(t("wine_lineup_err"));}
    finally{
      if(btn)btn.classList.remove("loading");if(lbl)lbl.textContent=t("wine_lineup");
    }
  }
  const wineLineupBtn=$("#wineLineupBtn");const wineLineupInput=$("#wineLineupInput");
  if(wineLineupBtn&&wineLineupInput){
    wineLineupBtn.addEventListener("click",()=>wineLineupInput.click());
    wineLineupInput.addEventListener("change",()=>{const f=wineLineupInput.files[0];wineLineupInput.value="";if(f)doLineupScan(f);});
  }
  const lineupCloseBtn=$("#lineupClose");if(lineupCloseBtn)lineupCloseBtn.addEventListener("click",()=>{const s=$("#lineupScrim");if(s)s.style.display="none";});
  const lineupAddAllBtn=$("#lineupAddAll");if(lineupAddAllBtn)lineupAddAllBtn.addEventListener("click",()=>{
    const readable=lineupWines.filter(w=>w.readable!==false&&(w.name||w.producer));
    readable.forEach(w=>{
      state.wines.push({id:id(),name:w.name||"",producer:w.producer||"",vint:w.vint||w.vintage||"",type:w.type||"andet",land:w.land||"",region:w.region||"",grape:w.grape||"",glasses:0,bottles:0,opened:1,imageUrl:_lineupImageUrl||null,about:w.about||"",fromLineup:true});
    });
    save();renderWines();
    const s=$("#lineupScrim");if(s)s.style.display="none";
    showToast(lang==="da"?readable.length+" vine tilføjet":readable.length+" wines added");
  });

  $("#addWineBtn").addEventListener("click",()=>openWineSheet(null,"edit"));
  const _lvlBar=document.getElementById("wineLevelBar");if(_lvlBar)_lvlBar.addEventListener("click",openAchievements);
  function wineNorm(s){return (s||"").toLowerCase().replace(/[^a-z0-9æøå]/g," ").replace(/\s+/g," ").trim();}
  function wineSimilar(a,b){
    const na=wineNorm(a.name)+" "+wineNorm(a.producer);
    const nb=wineNorm(b.name)+" "+wineNorm(b.producer);
    if(!na.trim()||!nb.trim())return false;
    const wa=new Set(na.split(" ").filter(x=>x.length>2));
    const wb=new Set(nb.split(" ").filter(x=>x.length>2));
    if(!wa.size||!wb.size)return false;
    let shared=0;wa.forEach(w=>{if(wb.has(w))shared++;});
    return shared/Math.min(wa.size,wb.size)>=0.6;
  }
  const _LEVELS=[
    {da:"Nybegynder",en:"Rookie",xp:0},
    {da:"Vinelsker",en:"Wine Lover",xp:100},
    {da:"Entusiast",en:"Enthusiast",xp:300},
    {da:"Kendere",en:"Connoisseur",xp:600},
    {da:"Sommelier",en:"Sommelier",xp:1000},
    {da:"Chef Sommelier",en:"Head Sommelier",xp:1800},
    {da:"Maître de Cave",en:"Maître de Cave",xp:3000},
  ];
  const _ACHS=[
    {id:"first",cat:{da:"Kælder",en:"Cellar"},icon:"🍷",da:"Første skænk",en:"First Pour",check:s=>s.wines.length>=1},
    {id:"five",cat:{da:"Kælder",en:"Cellar"},icon:"🏠",da:"Lille kælder",en:"Baby Cellar",check:s=>s.wines.length>=5},
    {id:"collector",cat:{da:"Kælder",en:"Cellar"},icon:"📦",da:"Samleren",en:"The Collector",check:s=>s.wines.length>=25},
    {id:"hoarder",cat:{da:"Kælder",en:"Cellar"},icon:"👑",da:"Vinmonopolet",en:"The Hoarder",check:s=>s.wines.length>=50},
    {id:"wanderer",cat:{da:"Udforsker",en:"Explorer"},icon:"🗺️",da:"Rejsende",en:"Wanderer",check:s=>new Set(s.wines.map(w=>w.land).filter(Boolean)).size>=3},
    {id:"globetrotter",cat:{da:"Udforsker",en:"Explorer"},icon:"🌍",da:"Globetrotter",en:"Globetrotter",check:s=>new Set(s.wines.map(w=>w.land).filter(Boolean)).size>=8},
    {id:"grapeH",cat:{da:"Udforsker",en:"Explorer"},icon:"🍇",da:"Druejæger",en:"Grape Hunter",check:s=>{const g=new Set();s.wines.forEach(w=>(w.grape||"").split(",").forEach(x=>{x=x.trim().replace(/\s*\d+\s*%/,"").toLowerCase().trim();if(x)g.add(x);}));return g.size>=5;}},
    {id:"grapeN",cat:{da:"Udforsker",en:"Explorer"},icon:"🔬",da:"Druenørd",en:"Grape Nerd",check:s=>{const g=new Set();s.wines.forEach(w=>(w.grape||"").split(",").forEach(x=>{x=x.trim().replace(/\s*\d+\s*%/,"").toLowerCase().trim();if(x)g.add(x);}));return g.size>=15;}},
    {id:"photo",cat:{da:"Scanner",en:"Scanner"},icon:"📸",da:"Fotografen",en:"Photographer",check:s=>s.wines.some(w=>w.imageUrl)},
    {id:"lineup1",cat:{da:"Scanner",en:"Scanner"},icon:"🔍",da:"Lineup-pro",en:"Lineup Pro",check:s=>s.wines.some(w=>w.fromLineup)},
    {id:"lineup5",cat:{da:"Scanner",en:"Scanner"},icon:"⚡",da:"Lineup-addict",en:"Lineup Addict",check:s=>s.wines.filter(w=>w.fromLineup).length>=5},
    {id:"bubbly",cat:{da:"Typer",en:"Types"},icon:"🥂",da:"Boblerne",en:"Bubbly",check:s=>s.wines.some(w=>w.type==="mousserende")},
    {id:"rose",cat:{da:"Typer",en:"Types"},icon:"🌹",da:"Rosé gang",en:"Rosé Gang",check:s=>s.wines.some(w=>w.type==="rose")},
    {id:"red10",cat:{da:"Typer",en:"Types"},icon:"❤️",da:"Rødvinsromantiker",en:"Red Romanticist",check:s=>s.wines.filter(w=>w.type==="rod").length>=10},
    {id:"white5",cat:{da:"Typer",en:"Types"},icon:"⭐",da:"Hvid & stolt",en:"White & Proud",check:s=>s.wines.filter(w=>w.type==="hvid").length>=5},
  ];
  function computeXP(){
    const countries=new Set(state.wines.map(w=>w.land).filter(Boolean));
    const grapes=new Set();state.wines.forEach(w=>(w.grape||"").split(",").forEach(g=>{g=g.trim().replace(/\s*\d+\s*%/,"").toLowerCase().trim();if(g)grapes.add(g);}));
    return state.wines.length*10+countries.size*25+grapes.size*15+state.wines.filter(w=>w.fromLineup).length*10+state.wines.filter(w=>w.imageUrl).length*5;
  }
  function getLevelInfo(xp){
    let lvl=_LEVELS[0],next=_LEVELS[1];
    for(let i=0;i<_LEVELS.length;i++){if(xp>=_LEVELS[i].xp){lvl=_LEVELS[i];next=_LEVELS[i+1]||null;}}
    const pct=next?Math.min(100,Math.round((xp-lvl.xp)/(next.xp-lvl.xp)*100)):100;
    return{title:lang==="da"?lvl.da:lvl.en,xp,pct,nextXp:next?next.xp:null,nextTitle:next?(lang==="da"?next.da:next.en):null};
  }
  function renderLevelBar(){
    const bar=document.getElementById("wineLevelBar");if(!bar)return;
    if(!state.wines.length){bar.style.display="none";return;}
    bar.style.display="flex";
    const info=getLevelInfo(computeXP());
    const rankEl=document.getElementById("wineLevelRank");if(rankEl)rankEl.textContent=info.title;
    const fill=document.getElementById("wineLevelXpFill");if(fill)fill.style.width=info.pct+"%";
    const lbl=document.getElementById("wineLevelXpLbl");if(lbl)lbl.textContent=info.nextXp?info.xp+" / "+info.nextXp+" XP":info.xp+" XP";
  }
  function openAchievements(){
    const modal=document.getElementById("wAchievModal");if(!modal)return;
    const content=document.getElementById("wAchievContent");if(!content)return;
    const xp=computeXP();const info=getLevelInfo(xp);
    const cats={};_ACHS.forEach(a=>{const c=lang==="da"?a.cat.da:a.cat.en;if(!cats[c])cats[c]=[];cats[c].push(a);});
    const nextTxt=info.nextXp?(lang==="da"?`Næste: ${info.nextTitle} · ${info.nextXp-xp} XP mangler`:`Next: ${info.nextTitle} · ${info.nextXp-xp} XP to go`):(lang==="da"?"Max level! 🎉":"Max level! 🎉");
    let html=`<div class="wach-level-card"><div class="wach-level-icon">🏆</div><div class="wach-level-name">${esc(info.title)}</div><div class="wach-level-xp">${xp} XP</div><div class="wach-level-xp-wrap"><div class="wach-level-xp-fill" style="width:${info.pct}%"></div></div><div class="wach-level-next">${esc(nextTxt)}</div></div>`;
    Object.entries(cats).forEach(([cat,list])=>{
      const unlockedCount=list.filter(a=>a.check(state)).length;
      html+=`<div class="wach-section"><div class="wach-section-ttl wach-open">${esc(cat)}<span style="font-size:10px;color:var(--faint);font-weight:400;text-transform:none;letter-spacing:0">${unlockedCount}/${list.length}</span><span class="wach-section-chev">›</span></div><div class="wach-grid">`;
      list.forEach(a=>{const on=a.check(state);html+=`<div class="wach-badge${on?" on":""}"><div class="wach-badge-icon">${a.icon}</div><div class="wach-badge-name">${esc(lang==="da"?a.da:a.en)}</div></div>`;});
      html+="</div></div>";
    });
    content.innerHTML=html;
    document.getElementById("wAchievTitle").textContent="Achievements";
    content.querySelectorAll(".wach-section-ttl").forEach(ttl=>{
      ttl.addEventListener("click",()=>{const open=ttl.classList.toggle("wach-open");const grid=ttl.nextElementSibling;if(grid)grid.classList.toggle("wach-hidden",!open);});
    });
    modal.style.display="flex";
    modal.onclick=e=>{if(e.target===modal)modal.style.display="none";};
    document.getElementById("wAchievClose").onclick=()=>modal.style.display="none";
  }
  let _pendingWineData=null;
  function doWineCommit(data,mergeInto){
    const {name,producer,land,region,grape,vint,imageUrl,type,about}=data;
    let resultWine=null;
    const prevXp=computeXP();const prevLvl=getLevelInfo(prevXp).title;
    if(mergeInto){
      mergeInto.glasses=(mergeInto.glasses||0)+data.glasses;
      mergeInto.bottles=(mergeInto.bottles||0)+data.bottles;
      mergeInto.opened=(mergeInto.opened||0)+(data.opened||0);
      if(!mergeInto.imageUrl&&imageUrl)mergeInto.imageUrl=imageUrl;
      if(!mergeInto.about&&about)mergeInto.about=about;
      resultWine=mergeInto;
    } else if(_waWineId){
      const w=state.wines.find(x=>x.id===_waWineId);
      if(w){Object.assign(w,{name,producer,land,region,grape,vint,imageUrl,type,about});resultWine=w;}
    } else {
      const nw={id:id(),name,producer,land,region,grape,vint,glasses:data.glasses||0,bottles:data.bottles||0,imageUrl,type,about};
      state.wines.unshift(nw);resultWine=nw;
    }
    save();renderWines();renderCareer();
    const newXp=computeXP();const newLvl=getLevelInfo(newXp).title;
    if(newLvl!==prevLvl)showToast("🏆 "+newLvl+"!");
    else if(newXp>prevXp)showToast("+"+(newXp-prevXp)+" XP");
    if(resultWine){openWineSheet(resultWine.id,"view");}else closeWineSheet();
  }
  document.getElementById("wineDupMerge").addEventListener("click",()=>{if(!_pendingWineData)return;doWineCommit(_pendingWineData,_pendingWineData._match);_pendingWineData=null;document.getElementById("wineDupScrim").classList.remove("open");});
  document.getElementById("wineDupNew").addEventListener("click",()=>{if(!_pendingWineData)return;const d=_pendingWineData;_pendingWineData=null;document.getElementById("wineDupScrim").classList.remove("open");doWineCommit(d,null);});
  attachAC(document.getElementById("waProducer"),()=>wineSuggest("producer"));
  attachAC(document.getElementById("waLand"),()=>wineSuggest("land"));
  attachAC(document.getElementById("waRegion"),()=>wineSuggest("region"));

  // ---- quick log ----
  async function parseLog(text){
    if(_proEnforced&&!_isPro)return [];  // Gratis (og gating tændt): spring AI over → lokal parser
    const base=apiBase();if(!base)throw new Error("no-backend");
    const token=await getToken();if(!token)throw new Error("no-auth");
    const counters=state.counters.map(c=>({label:c.label,subs:c.subs.map(s=>s.name),muligeTyper:c.suggest||[]}));
    const wines=state.wines.map(w=>w.name).filter(Boolean);
    const _ctrl=new AbortController();const _to=setTimeout(()=>_ctrl.abort(),8000);
    try{const res=await fetch(base+"/api/parse-log",{signal:_ctrl.signal,method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({text,counters,wines,lang})});clearTimeout(_to);if(!res.ok)throw new Error("Backend "+res.status);const data=await res.json();return Array.isArray(data.actions)?data.actions:[];}
    catch(e){clearTimeout(_to);throw e;}
  }
  // Optimistisk parsing: matcher teksten KUN eksisterende tællere/vine lokalt,
  // anvendes den øjeblikkeligt uden AI-kald. Nye ting går stadig til AI.
  function confidentLocalActions(text){
    let actions=[];
    try{actions=localParse(text);}catch(e){return null;}
    if(!actions.length)return null;
    for(const a of actions){
      if(a.kind==="counter"){if(!findCounter(a.counter))return null;}
      else if(a.kind==="wine"){
        const nm=(a.wine||"").toLowerCase();
        if(!state.wines.some(x=>x.name&&x.name.toLowerCase()===nm))return null;
      }else return null;
    }
    return actions;
  }
  function findCounter(name){
    const n=(name||"").toLowerCase();if(!n)return null;
    const forms=c=>{const l=c.label.toLowerCase();return [l,(_LBL_DA2EN[l]||"").toLowerCase(),(_LBL_EN2DA[l]||"").toLowerCase()].filter(Boolean);};
    return state.counters.find(c=>forms(c).some(f=>f===n))
      ||state.counters.find(c=>forms(c).some(f=>f.includes(n)||n.includes(f)));
  }
  function addToSub(c,subName,delta,summary){
    const canon=(c.suggest||[]).find(x=>x.toLowerCase()===subName.toLowerCase())||subName;
    let s=c.subs.find(x=>x.name.toLowerCase()===canon.toLowerCase());
    if(!s){if(c.subs.length===0&&c.count>0){c.subs.push({id:id(),name:"Uden type",count:c.count});c.count=0;}s={id:id(),name:canon,count:0};c.subs.push(s);if(!c.suggest.some(x=>x.toLowerCase()===canon.toLowerCase()))c.suggest.push(canon);}
    s.count=Math.max(0,s.count+delta);
    summary.push((delta>0?"+":"")+delta+" "+canon+" ("+c.label+")");
  }
  const VALID_CAT_IDS=new Set(["aabnet-mad","aabnet-drikke","snittet","tilberedt","serveret","andet"]);
  function _guessCat(a){
    if(a.cat&&(VALID_CAT_IDS.has(a.cat)||(state.customCats||[]).some(cc=>cc.id===a.cat)))return a.cat;
    return CAT_BY_LABEL[(a.counter||"").toLowerCase()]||"andet";
  }
  function applyOne(a,summary,syncItems,cats){
    if(a.kind==="counter"){
      const delta=parseInt(a.delta,10)||0;if(delta===0)return;
      let c=findCounter(a.counter);
      if(!c){
        let nm=a.counter||"Ny tæller";
        if(a.counter_da&&a.counter_en){nm=lang==="en"?a.counter_en:a.counter_da;registerLabelPair(a.counter_da,a.counter_en);}
        c={id:id(),label:nm,count:0,unit:"stk",cat:_guessCat(a),subs:[],suggest:seedFor(nm)};state.counters.push(c);
        if(!(a.counter_da&&a.counter_en))requestLabelTranslation(nm);
      }
      const subName=(a.sub||"").trim();
      if(subName){addToSub(c,subName,delta,summary);}
      else if(c.subs.length){let s=c.subs.find(x=>x.name==="Uden type");if(!s){s={id:id(),name:"Uden type",count:0};c.subs.push(s);}s.count=Math.max(0,s.count+delta);summary.push((delta>0?"+":"")+delta+" "+c.label);}
      else{c.count=Math.max(0,c.count+delta);summary.push((delta>0?"+":"")+delta+" "+c.label);}
      if(syncItems)syncItems.push({categoryLabel:c.label,delta});
      if(cats)cats.push(c.cat||"andet");
    }else if(a.kind==="wine"){
      const delta=parseInt(a.delta,10)||0;if(delta===0)return;
      if(cats)cats.push("wine");
      const measure=a.measure==="bottles"?"bottles":a.measure==="opened"?"opened":"glasses";
      const nm=(a.wine||"").toLowerCase();
      let w=state.wines.find(x=>x.name.toLowerCase()===nm)||state.wines.find(x=>x.name&&(x.name.toLowerCase().includes(nm)||nm.includes(x.name.toLowerCase())));
      if(!w){w={id:id(),name:a.wine||"Ukendt vin",producer:a.producer||"",land:a.country||"",region:a.region||"",grape:a.grape||"",vint:"",glasses:0,bottles:0,opened:0};state.wines.unshift(w);}
      w[measure]=Math.max(0,(w[measure]||0)+delta);
      const measureLbl=measure==="bottles"?t("bottles").toLowerCase():measure==="opened"?(lang==="da"?"åbnet":"opened"):t("glasses").toLowerCase();
      summary.push((delta>0?"+":"")+delta+" "+measureLbl+" "+w.name);
    }
  }
  const STOPVERBS=new Set(["jeg","har","i","dag","idag","åbnet","åbnede","åbent","snittet","skåret","skar","hakkede","hakket","serveret","serverede","stegt","stegte","grillet","grillede","lavet","lavede","poleret","polerede","drukket","smagt","smagte","tilberedt","tilberedte","til","en","et","af","med","og","stk","styk","styks","portioner","portion","glas","stykker","have","has","opened","open","cut","chopped","served","grilled","made","polished","drank","tasted","prepared","to","a","an","of","with","and","pcs","pieces","portions","glasses","i","ca","ca.","cirka","approximately","about","nogle","some","approximately"]);
  const DA_VERB_STEM={"åbnede":"åbnet","hakkede":"hakket","serverede":"serveret","stegte":"stegt","grillede":"grillet","lavede":"lavet","polerede":"poleret","smagte":"smagt","tilberedte":"tilberedt","snittet":"snit","skåret":"skær","drak":"drukket"};
  function normWord(w){return DA_VERB_STEM[w]||w;}
  function _clauseCat(low){
    const drink=/vin\b|øl|flask|champagne|sodavand|juice|drink|cocktail|kaffe|\bte\b|vand\b|bobler/.test(low);
    if(/åbn|\bopen/.test(low))return drink?"aabnet-drikke":"aabnet-mad";
    if(/snit|skar|skær|hak|chop|\bcut/.test(low))return "snittet";
    if(/lavede|lavet|tilbered|stegte|stegt|grill|bagte|bagt|kogte|kogt|mixede|mixet|\bmade|\bprepared|\bcooked|\bbaked|\bmixed/.test(low))return "tilberedt";
    if(/server|\bserved/.test(low))return "serveret";
    return "andet";
  }
  function localParse(text){
    const clauses=text.split(/\s+og\s+|\s+and\s+|,/i);const actions=[];
    clauses.forEach(cl=>{
      const low=cl.toLowerCase().trim();
      // extract number: "500", "500 stk", also handle "et"=1
      const numM=low.match(/\b(\d+)\b/);
      const delta=numM?parseInt(numM[1],10):/\bet\b|\ben\b/i.test(low)?1:1;
      const words=low.split(/\s+/).map(normWord);
      const normLow=words.join(" ");

      // 1. match suggest/sub names
      let best=null;
      state.counters.forEach(c=>{[...(c.suggest||[]),...c.subs.map(s=>s.name)].forEach(cand=>{
        if(cand&&normLow.includes(cand.toLowerCase())&&(!best||cand.length>best.sub.length))
          best={counter:c.label,sub:cand};
      });});
      if(best){actions.push({kind:"counter",counter:best.counter,sub:best.sub,delta});return;}

      // 2. match wine names
      let wine=null;
      state.wines.forEach(w=>{if(w.name&&normLow.includes(w.name.toLowerCase())&&(!wine||w.name.length>wine.length))wine=w.name;});
      if(wine){const _m=/åbn|\bopen/.test(normLow)?"opened":/flask|flaske|bottle/.test(normLow)?"bottles":"glasses";actions.push({kind:"wine",wine,measure:_m,delta});return;}

      // 3. match counter label words (stem-normalized)
      let cnt=null;
      state.counters.forEach(c=>{
        c.label.toLowerCase().split(/\s+/).map(normWord).filter(w=>w.length>=3&&!STOPVERBS.has(w)).forEach(w=>{
          if(normLow.includes(w)&&(!cnt||w.length>cnt.len))cnt={label:c.label,len:w.length};
        });
      });
      if(cnt){actions.push({kind:"counter",counter:cnt.label,sub:"",delta});return;}

      // 4. extract leftover noun words as new category name
      const numStart=low.search(/\d/);
      const nameStr=numStart>=0?low.slice(numStart).replace(/^\d+[\s,.]*(?:stk|styk|styks|pcs|pieces|x)?\s*/i,""):low;
      const nouns=nameStr.split(/\s+/).map(normWord).filter(w=>w.length>=2&&!STOPVERBS.has(w));
      if(nouns.length){const raw=nouns.join(" ");actions.push({kind:"counter",counter:raw.charAt(0).toUpperCase()+raw.slice(1),sub:"",delta,cat:_clauseCat(low)});}
    });
    return actions;
  }
  let toastTimer=null,undoSnapshot=null;
  // Feed-sync venter til fortryd-vinduet er lukket, så Fortryd også gælder serveren
  let _deferredSync=null,_deferredSyncTimer=null;
  function deferSync(items,imageUrl,summary){
    flushDeferredSync();
    if(!items||!items.length)return;
    _deferredSync={items,imageUrl,summary};
    _deferredSyncTimer=setTimeout(flushDeferredSync,6600);
  }
  function flushDeferredSync(){
    if(_deferredSyncTimer){clearTimeout(_deferredSyncTimer);_deferredSyncTimer=null;}
    const d=_deferredSync;_deferredSync=null;
    if(d)d.items.forEach(x=>syncLogEntry(x.categoryLabel,x.delta,d.imageUrl,false,d.summary));
  }
  function cancelDeferredSync(){if(_deferredSyncTimer){clearTimeout(_deferredSyncTimer);_deferredSyncTimer=null;}_deferredSync=null;}
  function showToast(msg){
    clearTimeout(toastTimer);$("#toastMsg").textContent=msg;
    const toast=$("#toast");toast.classList.add("show");
    toastTimer=setTimeout(()=>toast.classList.remove("show"),6500);
  }
  $("#toastUndo").addEventListener("click",()=>{cancelDeferredSync();if(undoSnapshot){state=undoSnapshot;undoSnapshot=null;save();renderCounters();renderWines();renderCareer();renderVagt();}$("#toast").classList.remove("show");});
  async function runQuickLog(){
    const input=$("#qlogInput");const text=input.value.trim();if(!text)return;
    let imageUrl=null;
    if(pendingPhotoDataUrl){$("#qlogSpin").hidden=false;imageUrl=await uploadPendingPhoto();$("#qlogSpin").hidden=true;}
    let actions=confidentLocalActions(text)||[];
    if(!actions.length){
      $("#qlogSpin").hidden=false;input.disabled=true;
      try{actions=await parseLog(text);}catch(e){console.warn("AI parse unavailable:",e);}
      if(!actions.length)actions=localParse(text);
      $("#qlogSpin").hidden=true;input.disabled=false;
    }
    if(!actions.length){showToast(t("toast_unknown"));input.focus();return;}
    undoSnapshot=clone(state);
    const summary=[],ask=[],syncItems=[],cats=[];
    actions.forEach(a=>{if(a.kind==="counter"&&!findCounter(a.counter))ask.push(a);else applyOne(a,summary,syncItems,cats);});
    input.value="";save();renderCounters();renderWines();renderCareer();
    if(!ask.length){finishLog(summary,syncItems,imageUrl,cats);return;}
    processAsk(ask,0,summary,syncItems,imageUrl,cats);
  }
  function finishLog(summary,syncItems,imageUrl,cats){
    const msg=summary.length?(t("toast_logged")+summary.join(", ")):t("toast_nothing");
    showToast(msg);
    if(summary.length){addLogEntry(summary.join(" · "),imageUrl,cats&&cats[0]);haptic(40);}
    const logSummary=summary.join(" · ");
    deferSync(syncItems,imageUrl,logSummary);
    checkBadges();checkRecords();
    if(summary.length)maybeNudgeShiftStart();
    $("#qlogInput").focus();
  }
  function processAsk(ask,i,summary,syncItems,imageUrl,cats){if(i>=ask.length){finishLog(summary,syncItems,imageUrl,cats);return;}openAsk(ask[i],()=>processAsk(ask,i+1,summary,syncItems,imageUrl,cats),summary,syncItems,imageUrl,cats);}
  function openAsk(item,next,summary,syncItems,imageUrl,cats){
    const delta=parseInt(item.delta,10)||0;
    const detectedName=item.counter||"Ny ting";
    $("#askText").innerHTML='<b>'+esc((delta>0?"+":"")+delta+" "+detectedName)+'</b> '+esc(t("ask_no_match"));
    const nameInput=$("#askName");nameInput.value=detectedName;
    const sel=$("#askParent");sel.innerHTML=state.counters.map(c=>'<option value="'+c.id+'">'+esc(tLabel(c.label))+'</option>').join("");
    document.querySelector('input[name="askmode"][value="counter"]').checked=true;sel.disabled=true;
    const scrim=$("#askScrim");
    scrim._askSkip=()=>{scrim.classList.remove("open");scrim._askSkip=null;next();};
    scrim.classList.add("open");setTimeout(()=>nameInput.focus(),30);
    $("#askAdd").onclick=()=>{
      const name=(nameInput.value||"").trim()||detectedName;
      const mode=document.querySelector('input[name="askmode"]:checked').value;
      if(mode==="sub"){const parent=state.counters.find(c=>c.id===sel.value);if(parent){addToSub(parent,name,delta,summary);if(cats)cats.push(parent.cat||"andet");}}
      else{const c={id:id(),label:name,count:0,cat:"andet",subs:[],suggest:seedFor(name)};state.counters.push(c);requestLabelTranslation(name);const subName=(item.sub||"").trim();if(subName)addToSub(c,subName,delta,summary);else{c.count=Math.max(0,delta);summary.push((delta>0?"+":"")+delta+" "+c.label);if(syncItems)syncItems.push({categoryLabel:name,delta});}if(cats)cats.push("andet");}
      save();renderCounters();renderWines();renderCareer();scrim._askSkip=null;scrim.classList.remove("open");next();
    };
    $("#askSkip").onclick=()=>{if(scrim._askSkip)scrim._askSkip();};
  }
  document.querySelectorAll('input[name="askmode"]').forEach(r=>r.addEventListener("change",()=>{$("#askParent").disabled=document.querySelector('input[name="askmode"]:checked').value!=="sub";}));
  $("#qlogInput").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();runQuickLog();}});

  // ── AI bar (station view) ──
  async function runAiBar(){
    const inp=document.getElementById("stAiInp");if(!inp)return;
    const text=inp.value.trim();if(!text)return;
    const spin=document.getElementById("stAiSpin2");const send=document.getElementById("stAiSend");
    if(spin)spin.classList.add("on");if(send)send.disabled=true;inp.disabled=true;
    let actions=[];
    try{actions=await parseLog(text);}catch(e){console.warn("AI bar parse failed:",e);}
    if(!actions.length)actions=localParse(text);
    if(spin)spin.classList.remove("on");if(send)send.disabled=false;inp.disabled=false;
    if(!actions.length){showToast(t("toast_unknown"));inp.focus();return;}
    undoSnapshot=clone(state);
    const summary=[],ask=[],syncItems=[],cats=[];
    actions.forEach(a=>{if(a.kind==="counter"&&!findCounter(a.counter))ask.push(a);else applyOne(a,summary,syncItems,cats);});
    inp.value="";save();renderCounters();renderWines();renderCareer();
    if(!ask.length){finishLog(summary,syncItems,null,cats);return;}
    processAsk(ask,0,summary,syncItems,null,cats);
  }
  const _stAiSend=document.getElementById("stAiSend");
  if(_stAiSend)_stAiSend.addEventListener("click",runAiBar);
  const _stAiInp=document.getElementById("stAiInp");
  if(_stAiInp){
    _stAiInp.placeholder=lang==="da"?"Log hvad du lavede…":"Log what you did…";
    _stAiInp.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();runAiBar();}});
  }

  // Qlog focus overlay
  function openQlogOverlay(){
    const ov=$("#qlogOverlay");if(!ov)return;
    const inp=$("#qlogOverlayInput");
    const hint=$("#qlogOvHint");if(hint)hint.textContent=t("qlog_hint_full");
    if(inp){inp.placeholder=t("qlog_ph")||"";inp.value=$("#qlogInput").value||"";inp.style.height="auto";}
    ov.classList.add("open");
    reflectPendingPhoto();
    setTimeout(()=>{if(inp){inp.focus();inp.style.height="auto";inp.style.height=inp.scrollHeight+"px";}},60);
  }
  function closeQlogOverlay(){
    const ov=$("#qlogOverlay");if(ov)ov.classList.remove("open");
    const inp=$("#qlogOverlayInput");if(inp)inp.value="";
  }
  // Annullér = luk OG kassér et evt. vedhæftet foto (så det ikke hænger ved til
  // næste log). Submit bruger closeQlogOverlay, så fotoet overlever til upload.
  function cancelQlogOverlay(){closeQlogOverlay();clearPendingPhoto();}
  function submitQlogOverlay(){
    const inp=$("#qlogOverlayInput");if(!inp)return;
    const val=inp.value.trim();if(!val)return;
    const qi=$("#qlogInput");if(qi)qi.value=val;
    closeQlogOverlay();
    runQuickLog();
  }
  $("#qlogInput").addEventListener("focus",()=>{
    $("#qlogInput").blur();
    openQlogOverlay();
  });
  const qlogOvClose=$("#qlogOverlayClose");
  if(qlogOvClose)qlogOvClose.addEventListener("click",cancelQlogOverlay);
  const qlogOvBg=$("#qlogOverlay");
  if(qlogOvBg)qlogOvBg.addEventListener("click",e=>{if(e.target===qlogOvBg)cancelQlogOverlay();});
  const qlogOvInp=$("#qlogOverlayInput");
  if(qlogOvInp){
    qlogOvInp.addEventListener("keydown",e=>{
      if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();submitQlogOverlay();}
      if(e.key==="Escape"){cancelQlogOverlay();}
    });
    qlogOvInp.addEventListener("input",()=>{
      qlogOvInp.style.height="auto";
      qlogOvInp.style.height=qlogOvInp.scrollHeight+"px";
    });
  }

  document.querySelectorAll(".scrim").forEach(s=>s.addEventListener("click",e=>{if(e.target===s){if(s._askSkip)s._askSkip();else s.classList.remove("open");}}));

  // ── Drag-to-dismiss: greb-håndtaget øverst på sheets er nu ægte ──
  (function(){
    let drag=null;
    document.addEventListener("touchstart",e=>{
      if(window.innerWidth>600)return;
      const scrim=e.target.closest(".scrim.open");if(!scrim)return;
      const modal=e.target.closest(".modal");if(!modal)return;
      const r=modal.getBoundingClientRect();
      const y=e.touches[0].clientY;
      if(y-r.top>56)return; // kun i håndtags-zonen — indre scroll forbliver urørt
      drag={scrim,modal,startY:y,cur:0,t0:Date.now()};
      modal.style.transition="none";
    },{passive:true});
    document.addEventListener("touchmove",e=>{
      if(!drag)return;
      const dy=Math.max(0,e.touches[0].clientY-drag.startY);
      drag.cur=dy;
      drag.modal.style.transform="translateY("+dy+"px)";
    },{passive:true});
    document.addEventListener("touchend",()=>{
      if(!drag)return;
      const {scrim,modal,cur,t0}=drag;drag=null;
      const fast=cur>40&&(Date.now()-t0)<260;
      modal.style.transition="transform .28s cubic-bezier(.22,1,.36,1)";
      if(cur>120||fast){
        modal.style.transform="translateY(110%)";
        setTimeout(()=>{
          if(scrim._askSkip)scrim._askSkip();else scrim.classList.remove("open");
          modal.style.transition="";modal.style.transform="";
        },240);
        haptic(15);
      }else{
        modal.style.transform="";
        setTimeout(()=>{modal.style.transition="";},300);
      }
    },{passive:true});
  })();
  document.addEventListener("keydown",e=>{
    if(e.key==="Escape"){
      if(numtray.classList.contains("open")){closeNumtray();return;}
      document.querySelectorAll(".scrim.open").forEach(s=>{if(s._askSkip)s._askSkip();else s.classList.remove("open");});
    }
  });
  function switchTab(v){
    track("tab",{t:v});
    if(v!=="vagt"&&vagtTimerInterval){clearInterval(vagtTimerInterval);vagtTimerInterval=null;}
    const _sb=document.getElementById("shiftBar"),_ss=document.getElementById("shiftStartBtn");
    if(_sb)_sb.style.display=v==="vagt"?"none":"";
    if(_ss)_ss.style.display="none";
    function doSwitch(){
      document.querySelectorAll(".bnav-btn").forEach(x=>x.classList.toggle("active",x.dataset.tab===v));
      ["station","vin","social","feed","lab","vagt","history","stats","profile"].forEach(n=>{const ve=document.getElementById("view-"+n);if(ve)ve.classList.toggle("active",v===n);});
      const aiBar=document.getElementById("stAiBar");if(aiBar)aiBar.classList.toggle("on",v==="station");
      if(v==="vagt")renderVagt();
      if(v==="social")loadSocial();
      if(v==="feed"){loadFeed(false);loadFollowRequests();}
      if(v==="lab")renderLabSeg();
      if(v==="history"){_buildVagtActivity(document.getElementById("historyShifts"));renderLogView();}
      if(v==="stats"){
        _buildStatsHero(document.getElementById("statsHero"));
        _buildStatsHighlights(document.getElementById("statsHighlights"));
        _buildStatsBadges(document.getElementById("statsBadges"));
        _buildVagtQuickStats(document.getElementById("statsQuick"),getShift());
      }
      if(v==="profile"){
        _loadProfileFields();
        _buildProfileCareerStrip(document.getElementById("profileCareerStrip"));
        renderSocialTeam();
        loadFollowRequests();
      }
      window.scrollTo({top:0,behavior:"instant"});
    }
    if(document.startViewTransition){document.startViewTransition(doSwitch);}else{doSwitch();}
  }
  document.querySelectorAll(".bnav-btn").forEach(btn=>btn.addEventListener("click",()=>{
    if(btn.dataset.action==="qlog"){haptic(20);openQlogOverlay();return;}
    if(btn.classList.contains("active")){
      const sc=document.getElementById("appScroll");
      if(sc)sc.scrollTo({top:0,behavior:"smooth"});
      return;
    }
    if(btn.dataset.tab==="vin"&&!requirePro())return;  // Vin er Pro
    switchTab(btn.dataset.tab);
  }));

  function openLogDrawer(){$("#logDrawer").classList.add("open");$("#logScrim").classList.add("open");}
  function goToTeams(){switchTab("profile");}
  // ── Manuel dark mode: lys er standard, kontakten bor i menuen ──
  function _applyTheme(theme){
    document.documentElement.dataset.theme=theme;
    const meta=document.getElementById("themeColorMeta");
    if(meta)meta.setAttribute("content",theme==="dark"?"#171114":"#8A2E3F");
    const ico=$("#themeDrawerIcon"),lbl=$("#themeDrawerLbl");
    if(ico)ico.textContent=theme==="dark"?"☀️":"🌙";
    if(lbl)lbl.textContent=theme==="dark"?(lang==="da"?"Lyst tema":"Light theme"):(lang==="da"?"Mørkt tema":"Dark theme");
  }
  _applyTheme(localStorage.getItem("mise_theme")||"light");
  var _themeLink=$("#themeDrawerLink");
  if(_themeLink)_themeLink.addEventListener("click",()=>{
    const next=(localStorage.getItem("mise_theme")||"light")==="dark"?"light":"dark";
    localStorage.setItem("mise_theme",next);
    _applyTheme(next);haptic(20);track("theme",{t:next});
  });
  function _drawerGoTab(v){closeLogDrawer();switchTab(v);}
  // ── Pro-rettighed ──
  function requirePro(){ if(!_proEnforced||_isPro)return true; openPaywall(); return false; }
  function openPaywall(){ const s=$("#paywallScrim"); if(s)s.classList.add("open"); }
  function closePaywall(){ const s=$("#paywallScrim"); if(s)s.classList.remove("open"); }
  // Viser/skjuler PRO-mærker rundt i UI'et efter rettighed
  function applyProState(){
    const gate=_proEnforced&&!_isPro;document.querySelectorAll(".pro-pill").forEach(el=>{el.style.display=gate?"":"none";});
  }
  var _mProfile=$("#menuDrawerProfile");if(_mProfile)_mProfile.addEventListener("click",()=>_drawerGoTab("profile"));
  var _mHistory=$("#menuDrawerHistory");if(_mHistory)_mHistory.addEventListener("click",()=>_drawerGoTab("history"));
  var _mSoc=$("#menuDrawerSocial");if(_mSoc)_mSoc.addEventListener("click",()=>_drawerGoTab("social"));
  var _mLab=$("#menuDrawerLab");if(_mLab)_mLab.addEventListener("click",()=>{closeLogDrawer();if(requirePro())switchTab("lab");});
  var _mResume=$("#menuDrawerResume");if(_mResume)_mResume.addEventListener("click",()=>{closeLogDrawer();openResume();});
  { const rc=$("#resumeClose"); if(rc)rc.addEventListener("click",closeResume);
    const rx=$("#resumeExport"); if(rx)rx.addEventListener("click",openResumeShare);
    const rsd=$("#resumeShareDo"); if(rsd)rsd.addEventListener("click",shareResumeBlob);
    const rpi=$("#resumePhotoInput"); if(rpi)rpi.addEventListener("change",async()=>{
      const file=rpi.files&&rpi.files[0];if(!file)return;
      if(!file.type.startsWith("image/")){showToast(t("img_only"));rpi.value="";return;}
      if(file.size>20*1024*1024){showToast(lang==="da"?"Billedet er for stort (maks 20 MB)":"Image too large (max 20 MB)");rpi.value="";return;}
      const url=await resizeImage(file,600);rpi.value="";
      if(!url)return;
      getResume().photo=url;save();renderResumePreview();renderResumeEditor();
    }); }
  { const pc=$("#paywallClose"); if(pc)pc.addEventListener("click",closePaywall);
    const ps=$("#paywallScrim"); if(ps)ps.addEventListener("click",e=>{if(e.target===ps)closePaywall();});
    const pcta=$("#paywallCta"); if(pcta)pcta.addEventListener("click",()=>{ showToast(lang==="da"?"Køb åbner snart 🚀":"Purchases open soon 🚀"); }); }
  function closeLogDrawer(){$("#logDrawer").classList.remove("open");$("#logScrim").classList.remove("open");}
  var _burgerBtn=$("#burgerBtn");if(_burgerBtn)_burgerBtn.addEventListener("click",openLogDrawer);
  var _drawerClose=$("#logDrawerClose");if(_drawerClose)_drawerClose.addEventListener("click",closeLogDrawer);
  var _logScrim=$("#logScrim");if(_logScrim)_logScrim.addEventListener("click",closeLogDrawer);

  function skeletonRows(n){return Array.from({length:n},()=>'<div class="skel-row"></div>').join("");}

  // ---- streak ----
  function calcStreak(){
    if(!state.log||!state.log.length)return 0;
    const days=new Set(state.log.map(e=>{const d=new Date(e.ts);return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();}));
    let streak=0;
    const now=new Date();
    for(let i=0;i<365;i++){
      const d=new Date(now.getFullYear(),now.getMonth(),now.getDate()-i);
      const key=d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
      if(days.has(key)){streak++;}
      else if(i>0)break;
    }
    return streak;
  }
  function totalActiveDays(){
    if(!state.log||!state.log.length)return 0;
    const days=new Set(state.log.map(e=>{const d=new Date(e.ts);return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();}));
    return days.size;
  }
  function renderStreak(){
    const el=$("#streakLbl");if(el)el.textContent="";
  }

  // ---- smart qlog suggestions ----
  function recentLogPhrases(){
    const seen=new Set();const out=[];
    (state.log||[]).slice(0,120).forEach(e=>{
      if(!e.text)return;
      e.text.split(" · ").forEach(p=>{p=p.trim();if(p.length>3&&!seen.has(p)){seen.add(p);out.push(p);}});
    });
    return out;
  }

  // ---- notification permission ----
  async function requestNotifPermission(){
    registerNativePush(true);          // native iOS (no-op på web) — må godt spørge her
    if(!("Notification" in window))return;
    if(Notification.permission==="default")await Notification.requestPermission();
    if(Notification.permission==="granted")ensurePushSubscription();
  }
  // ---- Native iOS push (APNs via Capacitor) ----
  let _nativePushListeners=false;
  async function registerNativePush(mayPrompt){
    const P=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.PushNotifications;
    if(!P)return;                       // ikke i native app / plugin ikke til stede
    try{
      if(!_nativePushListeners){
        _nativePushListeners=true;
        P.addListener("registration",async(t)=>{
          const token=t&&t.value;if(!token)return;
          const base=apiBase();const tok=await getToken();if(!base||!tok)return;
          try{await fetch(base+"/api/push/register-native",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+tok},body:JSON.stringify({token,platform:"ios"})});}catch(e){}
        });
        P.addListener("registrationError",(e)=>console.warn("CT:push reg err",e&&e.error));
      }
      let perm=await P.checkPermissions();
      if(perm.receive!=="granted"){
        if(!mayPrompt)return;            // ved boot: spørg ikke — vent til et godt øjeblik
        perm=await P.requestPermissions();
      }
      if(perm.receive==="granted")await P.register();
    }catch(e){console.warn("CT:native push",e&&e.message);}
  }

  // ---- social / leaderboard / challenge / team ----
  function getJwtSub(){
    if(!session||!session.access_token)return null;
    try{const p=session.access_token.split(".")[1];const d=JSON.parse(atob(p.replace(/-/g,"+").replace(/_/g,"/")));return d.sub||null;}catch(e){return null;}
  }

  let _lbPeriod="week";
  function _lbMedalHtml(i){return i===0?'🥇':i===1?'🥈':i===2?'🥉':'<span style="font-size:12px;color:var(--faint)">'+(i+1)+'</span>';}
  function _lbRowsHtml(rows,myId){
    if(!rows.length)return '<div class="lb-empty">'+esc(t("lb_empty"))+'</div>';
    return rows.map((r,i)=>{
      const isMe=(r.user_id||r.userId)===myId;
      const nick=esc(r.nickname||r.username||t("lb_anon"))+(isMe?' <span class="lb-you">('+t("lb_you")+')</span>':'');
      const prof=r.profession?'<span class="lb-prof">'+esc(r.profession)+'</span>':'';
      return '<div class="lb-row'+(isMe?" lb-me":"")+'">'
        +'<span class="lb-medal">'+_lbMedalHtml(i)+'</span>'
        +'<span class="lb-name">'+nick+prof+'</span>'
        +'<span class="lb-score">'+(r.total||0)+'</span></div>';
    }).join("");
  }
  async function renderLeaderboard(period){
    period=period||_lbPeriod;_lbPeriod=period;
    const el=$("#lbContent");if(!el)return;
    el.innerHTML=skeletonRows(5);
    const base=apiBase();if(!base){el.innerHTML=esc(t("lb_empty"));return;}
    try{
      const token=await getToken();
      const res=await fetch(base+"/api/leaderboard?period="+period,{headers:token?{"Authorization":"Bearer "+token}:{}});
      const data=await res.json();
      const rows=data.leaderboard||[];
      const myId=getJwtSub();
      el.innerHTML=_lbRowsHtml(rows,myId);
    }catch(e){el.innerHTML=esc(t("lb_empty"));}
  }
  // Deterministisk gradient pr. hold (hashet på navnet)
  const TEAM_GRADS=[
    ["#2E1A3E","#6D3C8E"],["#12333B","#2C7A7B"],["#3B1A20","#8A2E3F"],
    ["#1A2E3B","#3B6E9E"],["#3B2A12","#B07C3A"],["#25321A","#5E8C4A"]
  ];
  function teamGrad(name){
    let h=0;const str=name||"?";
    for(let k=0;k<str.length;k++)h=(h*31+str.charCodeAt(k))>>>0;
    const g=TEAM_GRADS[h%TEAM_GRADS.length];
    return "linear-gradient(150deg,"+g[0]+" 0%,"+g[1]+" 100%)";
  }
  function _initial(n){return (n||"?").trim().charAt(0).toUpperCase()||"?";}

  function _teamCardHtml(team,members,lastWeekTotal,myId){
    const weekTotal=members.reduce((a,m)=>a+(m.total||0),0);
    const myIdx=members.findIndex(m=>m.userId===myId);
    const nowTs=Date.now();
    const avatars=members.slice(0,5).map(m=>{
      const active=m.lastTs&&(nowTs-m.lastTs)<3600000;
      return '<span class="tcard-av'+(active?" on":"")+'" title="'+esc(m.nickname||"?")+'">'+esc(_initial(m.nickname))+'</span>';
    }).join("")+(members.length>5?'<span class="tcard-av more">+'+(members.length-5)+'</span>':'');
    const trend=lastWeekTotal>0?Math.round((weekTotal-lastWeekTotal)/lastWeekTotal*100):null;
    const trendHtml=trend===null?'':'<div class="tcard-week-trend">'+(trend>=0?"▲ ":"▼ ")+Math.abs(trend)+'% '+(lang==="da"?"vs sidste uge":"vs last week")+'</div>';
    const maxTot=Math.max(1,...members.map(m=>m.total||0));
    const race=members.length>1?'<div class="tcard-race"><div class="tcard-race-track"></div>'
      +members.slice(0,8).map(m=>{
        const pct=6+((m.total||0)/maxTot)*88;
        return '<span class="tcard-race-dot'+(m.userId===myId?" me":"")+'" style="left:'+pct.toFixed(1)+'%" title="'+esc(m.nickname||"?")+'">'+esc(_initial(m.nickname))+'</span>';
      }).join("")+'</div>':'';
    const codeSp=(team.invite_code||"").split("").join(" ");
    return '<div class="tcard" data-team-id="'+esc(team.id)+'" style="background:'+teamGrad(team.name)+'">'
      +'<div class="tcard-top"><div class="tcard-name">'+esc(team.name)
        +(team.kind==="restaurant"?' <span class="tcard-resto-badge'+(team.status==="verified"?" ok":"")+'">'+(team.status==="verified"?"✓ "+(lang==="da"?"Verificeret":"Verified"):(lang==="da"?"Afventer":"Pending"))+'</span>':'')
        +(team.kind==="restaurant"&&team.city?'<div class="tcard-resto-city">'+esc(team.city)+'</div>':'')
        +'</div>'
      +(myIdx>=0?'<div class="tcard-rank">#'+(myIdx+1)+' '+(lang==="da"?"af":"of")+' '+members.length+'</div>':'')+'</div>'
      +'<div class="tcard-mid">'
        +'<div class="tcard-avatars" data-toggle-list="'+esc(team.id)+'" role="button" aria-label="'+(lang==="da"?"Vis rangliste":"Show ranking")+'">'+avatars+'</div>'
        +'<div class="tcard-week"><div class="tcard-week-num">'+fmtNum(weekTotal)+'</div><div class="tcard-week-lbl">'+(lang==="da"?"Ugens total":"This week")+'</div>'+trendHtml+'</div>'
      +'</div>'
      +race
      +'<div class="tcard-tear">'
        +'<div class="tcard-code" data-code="'+esc(team.invite_code)+'" role="button"><span class="tcard-code-lbl">'+(lang==="da"?"Invite-kode · tryk for at kopiere":"Invite code · tap to copy")+'</span>'+esc(codeSp)+'</div>'
        +'<button class="tcard-share" data-share-code="'+esc(team.invite_code)+'" data-share-name="'+esc(team.name)+'">'
        +'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>'
        +(lang==="da"?"Invitér":"Invite")+'</button>'
      +'</div>'
    +'</div>';
  }

  async function shareTeamInvite(code,name){
    const msg=(lang==="da"
      ?"Join mit hold \""+name+"\" i Craft Tracker! Brug koden "+code+" under Rangliste → Hold."
      :"Join my team \""+name+"\" in Craft Tracker! Use code "+code+" under Leaderboard → Team.");
    if(navigator.share){
      try{await navigator.share({title:"Craft Tracker",text:msg});return;}catch(e){if(e&&e.name==="AbortError")return;}
    }
    try{await navigator.clipboard.writeText(msg);showToast(lang==="da"?"Invitation kopieret 📋":"Invite copied 📋");}catch(e){}
  }

  async function renderSocialTeam(){
    const el=$("#socialTeamContent");if(!el)return;
    el.innerHTML=skeletonRows(3);
    const base=apiBase();const token=await getToken();
    if(!base||!token){el.innerHTML="";_renderSocialTeamAdd(el,true);return;}
    try{
      const res=await fetch(base+"/api/teams/mine",{headers:{"Authorization":"Bearer "+token}});
      const d=await res.json();const teams=d.teams||[];const myId=getJwtSub();
      let html="";
      teams.forEach(({team,members,lastWeekTotal})=>{
        html+=_teamCardHtml(team,members,lastWeekTotal||0,myId);
        html+='<div class="tcard-list" id="tlist-'+esc(team.id)+'">'
          +_lbRowsHtml(members.map(m=>({user_id:m.userId,nickname:m.nickname,profession:m.profession,total:m.total})),myId)
          +'<button class="tcard-leave" data-team-id="'+esc(team.id)+'">'+(lang==="da"?"Forlad holdet":"Leave team")+'</button>'
          +'</div>';
      });
      el.innerHTML=html;
      _renderSocialTeamAdd(el,teams.length===0);
      el.querySelectorAll("[data-toggle-list]").forEach(av=>av.addEventListener("click",()=>{
        const l=document.getElementById("tlist-"+av.dataset.toggleList);if(l)l.classList.toggle("open");haptic(15);
      }));
      el.querySelectorAll(".tcard-code").forEach(c=>c.addEventListener("click",()=>{
        navigator.clipboard.writeText(c.dataset.code||"").then(()=>{showToast(lang==="da"?"Kode kopieret 📋":"Code copied 📋");haptic(25);}).catch(()=>{});
      }));
      el.querySelectorAll(".tcard-share").forEach(b=>b.addEventListener("click",()=>shareTeamInvite(b.dataset.shareCode,b.dataset.shareName)));
      el.querySelectorAll(".tcard-leave").forEach(btn=>btn.addEventListener("click",async()=>{
        if(!confirm(lang==="da"?"Forlad dette hold? Dine delte retter bliver private igen.":"Leave this team? Your shared dishes become private again."))return;
        try{await fetch(base+"/api/teams/"+btn.dataset.teamId+"/leave",{method:"DELETE",headers:{"Authorization":"Bearer "+token}});invalidateLabTeams();_labSeg==="kitchen"&&renderLabSeg();renderSocialTeam();}catch(e){}
      }));
    }catch(e){el.innerHTML="";_renderSocialTeamAdd(el,true);}
  }

  // ── OTP-join + opret ──
  let _otpBusy=false;
  function _renderSocialTeamAdd(container,open){
    if(!open){
      const tog=document.createElement("button");
      tog.className="tcard-leave";tog.style.cssText="margin:2px 0 10px;color:var(--dim);font-size:12.5px;font-weight:700";
      tog.textContent=(lang==="da"?"＋ Join eller opret endnu et hold":"＋ Join or create another team");
      container.appendChild(tog);
      tog.addEventListener("click",()=>{tog.remove();_renderSocialTeamAdd(container,true);const b=container.querySelector(".otp-box");if(b)b.focus();});
      return;
    }
    const div=document.createElement("div");
    div.className="tjoin";
    div.innerHTML='<div class="tjoin-title">'+(lang==="da"?"Join et hold":"Join a team")+'</div>'
      +'<div class="tjoin-sub">'+(lang==="da"?"Indtast 6-tegns koden fra en kollega — I deler rangliste og opskrifter":"Enter the 6-char code from a colleague — you share the leaderboard and recipes")+'</div>'
      +'<div class="otp-row" id="otpRow">'+Array.from({length:6}).map((_,k)=>'<input class="otp-box" data-otp="'+k+'" maxlength="1" autocomplete="off" autocorrect="off" autocapitalize="characters" spellcheck="false" inputmode="text">').join("")+'</div>'
      +'<div class="otp-hint" id="otpHint"></div>'
      +'<div class="tjoin-div"><span>'+(lang==="da"?"eller":"or")+'</span></div>'
      +'<div class="tjoin-title">'+(lang==="da"?"Start dit eget":"Start your own")+'</div>'
      +(_restaurantsEnabled?'<div class="stac-type"><label class="stac-type-opt"><input type="radio" name="stacKind" value="crew" checked> '+(lang==="da"?"Hold":"Crew")+'</label><label class="stac-type-opt"><input type="radio" name="stacKind" value="restaurant"> '+(lang==="da"?"Restaurant":"Restaurant")+'</label></div>':'')
      +'<div class="team-form" style="margin-top:10px;margin-bottom:0"><input class="input stac-name-inp" placeholder="'+esc(lang==="da"?"fx Restaurant Nord":"e.g. Noma Kitchen")+'" maxlength="40"><button class="btn primary btn-sm stac-create-btn">'+esc(lang==="da"?"Opret":"Create")+'</button></div>'
      +(_restaurantsEnabled?'<input class="input stac-city-inp" placeholder="'+esc(lang==="da"?"By":"City")+'" maxlength="60" style="display:none;margin-top:8px"><div class="stac-resto-hint" style="display:none">'+esc(lang==="da"?"Restauranter godkendes manuelt før de vises som verificerede.":"Restaurants are approved manually before showing as verified.")+'</div>':'');
    container.appendChild(div);
    const boxes=[...div.querySelectorAll(".otp-box")];
    const row=div.querySelector("#otpRow");const hint=div.querySelector("#otpHint");
    function setHint(txt){if(hint)hint.textContent=txt||"";}
    function clearOtp(){boxes.forEach(b=>{b.value="";b.classList.remove("filled");});boxes[0].focus();}
    async function tryJoin(){
      if(_otpBusy)return;
      const code=boxes.map(b=>b.value).join("").toUpperCase();
      if(code.length!==6)return;
      _otpBusy=true;row.classList.add("checking");setHint(lang==="da"?"Tjekker koden…":"Checking code…");
      const base=apiBase();const token=await getToken();
      try{
        const r=await fetch(base+"/api/teams/join",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({code})});
        row.classList.remove("checking");
        if(!r.ok)throw new Error();
        haptic(60);setHint("");invalidateLabTeams();track("team_join");
        await showTeamWelcome(code);
        renderSocialTeam();
      }catch(e){
        row.classList.remove("checking");row.classList.add("err");haptic(80);
        setHint(lang==="da"?"Koden findes ikke — tjek den igen":"Code not found — check it again");
        setTimeout(()=>{row.classList.remove("err");clearOtp();},450);
      }
      _otpBusy=false;
    }
    boxes.forEach((b,k)=>{
      b.addEventListener("input",()=>{
        b.value=(b.value||"").replace(/[^a-zA-Z0-9]/g,"").toUpperCase().slice(0,1);
        b.classList.toggle("filled",!!b.value);
        if(b.value){haptic(8);if(k<5)boxes[k+1].focus();else tryJoin();}
      });
      b.addEventListener("keydown",e=>{
        if(e.key==="Backspace"&&!b.value&&k>0){boxes[k-1].focus();boxes[k-1].value="";boxes[k-1].classList.remove("filled");e.preventDefault();}
      });
      b.addEventListener("paste",e=>{
        e.preventDefault();
        const txt=((e.clipboardData||window.clipboardData).getData("text")||"").replace(/[^a-zA-Z0-9]/g,"").toUpperCase().slice(0,6);
        if(!txt)return;
        boxes.forEach((bx,m)=>{bx.value=txt[m]||"";bx.classList.toggle("filled",!!bx.value);});
        if(txt.length===6)tryJoin();else boxes[Math.min(txt.length,5)].focus();
      });
    });
    // Restaurant-valg → vis by-felt
    if(_restaurantsEnabled){
      const cityInp=div.querySelector(".stac-city-inp"),rHint=div.querySelector(".stac-resto-hint");
      div.querySelectorAll('input[name="stacKind"]').forEach(rb=>rb.addEventListener("change",()=>{
        const isResto=div.querySelector('input[name="stacKind"]:checked').value==="restaurant";
        if(cityInp)cityInp.style.display=isResto?"":"none";
        if(rHint)rHint.style.display=isResto?"":"none";
      }));
    }
    div.querySelector(".stac-create-btn").addEventListener("click",async()=>{
      const inp=div.querySelector(".stac-name-inp");const name=inp.value.trim();if(!name)return;
      const kindSel=div.querySelector('input[name="stacKind"]:checked');
      const isResto=_restaurantsEnabled&&kindSel&&kindSel.value==="restaurant";
      const city=isResto?(div.querySelector(".stac-city-inp").value||"").trim():"";
      const body={name};if(isResto){body.kind="restaurant";if(city)body.city=city;}
      const base=apiBase();const token=await getToken();if(!token)return;
      try{
        const r=await fetch(base+"/api/teams",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify(body)});
        if(!r.ok){showToast(lang==="da"?"Kunne ikke oprette — prøv igen":"Couldn't create — try again");return;}
        invalidateLabTeams();haptic(50);renderSocialTeam();
        showToast(isResto?(lang==="da"?"Restaurant oprettet — afventer godkendelse 🕘":"Restaurant created — pending approval 🕘"):(lang==="da"?"Holdet er oprettet — del koden med kollegerne 🎉":"Team created — share the code 🎉"));
      }catch(e){
        showToast(lang==="da"?"Ingen forbindelse — prøv igen":"No connection — try again");
      }
    });
  }

  // ── Velkomst-ceremonien ──
  async function showTeamWelcome(code){
    const ov=$("#teamWelcome");if(!ov)return;
    let team=null,members=[];
    try{
      const base=apiBase();const token=await getToken();
      const r=await fetch(base+"/api/teams/mine",{headers:{"Authorization":"Bearer "+token}});
      const d=await r.json();
      const hit=(d.teams||[]).find(x=>x.team.invite_code===code)||(d.teams||[])[0];
      if(hit){team=hit.team;members=hit.members||[];}
    }catch(e){}
    if(!team)return;
    ov.style.background=teamGrad(team.name);
    $("#twKicker").textContent=lang==="da"?"Velkommen til":"Welcome to";
    $("#twName").textContent=team.name;
    $("#twSub").textContent=lang==="da"?members.length+" på holdet · I deler rangliste og opskrifter":members.length+" on the team · shared leaderboard and recipes";
    $("#twSkip").textContent=lang==="da"?"Tryk for at fortsætte":"Tap to continue";
    const avs=$("#twAvs");
    avs.innerHTML=members.slice(0,7).map((m,k)=>'<span class="tw-av" style="animation-delay:'+(0.35+k*0.12)+'s">'+esc(_initial(m.nickname))+'</span>').join("");
    ov.classList.remove("out");ov.classList.add("on");
    haptic(60);setTimeout(()=>haptic(30),450);
    return new Promise(resolve=>{
      let done=false;
      function close(){if(done)return;done=true;ov.classList.add("out");setTimeout(()=>{ov.classList.remove("on","out");resolve();},420);}
      ov.addEventListener("click",close,{once:true});
      setTimeout(close,4200);
    });
  }

  async function renderChallenge(){
    const el=$("#challengeContent");if(!el)return;
    el.innerHTML='<div class="skel-row" style="width:60%;margin-bottom:10px"></div>'+skeletonRows(3);
    const base=apiBase();if(!base){el.innerHTML="";return;}
    try{
      const token=await getToken();
      const res=await fetch(base+"/api/challenge/current",{headers:token?{"Authorization":"Bearer "+token}:{}});
      const d=await res.json();
      const myId=getJwtSub();
      const monday=mondayLocal();
      const msLeft=(monday.getTime()+7*24*3600*1000)-Date.now();
      const daysLeft=Math.max(0,Math.ceil(msLeft/(24*3600*1000)));
      const rows=d.rows||[];
      const myEntry=rows.find(r=>r.user_id===myId);
      el.innerHTML='<div class="challenge-card">'
        +'<div class="challenge-cat">'+esc(d.category||"")+'</div>'
        +'<div class="challenge-sub">'+t("challenge_ends",daysLeft)+'</div>'
        +(myEntry?'<div class="challenge-mine">'+esc(t("team_this_week"))+': <b>'+myEntry.total+'</b></div>':'')
        +'</div>'
        +(rows.length?'<div class="lb-section">'
          +rows.slice(0,10).map((r,i)=>{
            const isMe=r.user_id===myId;
            const nick=esc(r.nickname||r.username||t("lb_anon"))+(isMe?' <span class="lb-you">('+t("lb_you")+')</span>':'');
            return '<div class="lb-row'+(isMe?" lb-me":"")+'">'+'<span class="lb-rank">'+(i+1)+'</span>'+'<span class="lb-name">'+nick+'</span>'+'<span class="lb-score">'+r.total+'</span></div>';
          }).join("")
        +'</div>':'');
    }catch(e){el.innerHTML="";}
  }
  function mondayLocal(){const d=new Date();d.setHours(0,0,0,0);const day=d.getDay();d.setDate(d.getDate()-((day+6)%7));return d;}

  let _activeSocialTab="global";
  function _switchSocialTab(tab){
    _activeSocialTab=tab;
    document.querySelectorAll(".social-tab").forEach(b=>b.classList.toggle("active",b.dataset.stab===tab));
    ["global","challenge"].forEach(id=>{const el=document.getElementById("social-"+id);if(el)el.style.display=id===tab?"":"none";});
    if(tab==="global")renderLeaderboard(_lbPeriod);
    else if(tab==="challenge")renderChallenge();
  }
  async function loadSocial(){
    document.querySelectorAll(".social-tab").forEach(btn=>{btn.onclick=()=>_switchSocialTab(btn.dataset.stab);});
    document.querySelectorAll(".lb-period-btn").forEach(btn=>{
      btn.onclick=()=>{document.querySelectorAll(".lb-period-btn").forEach(b=>b.classList.toggle("active",b===btn));renderLeaderboard(btn.dataset.period);};
    });
    const lbPW=document.getElementById("lbPeriodWeek");if(lbPW)lbPW.textContent=t("lb_period_week");
    const lbPM=document.getElementById("lbPeriodMonth");if(lbPM)lbPM.textContent=t("lb_period_month");
    const lbPA=document.getElementById("lbPeriodAll");if(lbPA)lbPA.textContent=t("lb_period_all");
    const stabG=document.getElementById("stab-global");if(stabG)stabG.textContent=t("stab_global");
    const stabC=document.getElementById("stab-challenge");if(stabC)stabC.textContent=t("stab_challenge");
    _switchSocialTab(_activeSocialTab);
  }

  // ---- profile modal ----
  function populateProfSelect(sel){
    const profs=t("professions");
    sel.innerHTML='<option value="">'+esc(t("profile_prof_default"))+'</option>'
      +profs.map(p=>'<option value="'+esc(p)+'">'+esc(p)+'</option>').join("");
  }
  function setProfileInitial(nickname,username){
    const el=$("#profileInitial");
    if(!el)return;
    const first=(nickname||username||"?").trim().charAt(0).toUpperCase();
    el.textContent=first;
  }

  async function _loadProfileFields(){
    const base=apiBase();const token=await getToken();
    const profSel=$("#profileProf");if(profSel)populateProfSelect(profSel);
    if(!base||!token)return;
    try{
      const res=await fetch(base+"/api/user/profile",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token}});
      if(!res.ok)throw new Error("HTTP "+res.status);
      const d=await res.json();
      const nickInp=$("#profileNick");if(d.nickname&&nickInp)nickInp.value=d.nickname;
      if(d.profession&&profSel)profSel.value=d.profession;
      const uInput=$("#profileUsername");
      if(uInput)uInput.value=d.username||"";
      const uStatus=$("#profileUsernameStatus");if(uStatus){uStatus.textContent="";uStatus.className="username-status";}
      _isPro=!!d.pro;applyProState();
      setProfileInitial(d.nickname,d.username);
    }catch(e){
      showToast(lang==="da"?"Kunne ikke hente din profil — prøv igen":"Couldn't load your profile — try again");
    }
  }
  function _buildProfileCareerStrip(container){
    if(!container)return;
    const streak=calcStreak();
    const earned=getBadgesEarned().length;
    container.innerHTML='<div class="pcs-stat"><span class="pcs-val">'+fmtNum(career())+'</span><span class="pcs-lbl">'+(lang==="da"?"Karriere":"Career")+'</span></div>'
      +'<div class="pcs-div"></div>'
      +'<div class="pcs-stat"><span class="pcs-val">'+fmtNum(streak)+'</span><span class="pcs-lbl">'+(lang==="da"?"Dage i træk":"Day streak")+'</span></div>'
      +'<div class="pcs-div"></div>'
      +'<div class="pcs-stat"><span class="pcs-val">'+earned+'/'+BADGE_DEFS.length+'</span><span class="pcs-lbl">'+(lang==="da"?"Achievements":"Achievements")+'</span></div>';
  }
  let _usernameCheckTimer=null;
  function setupUsernameInput(inputId,statusId,onValid){
    const input=$("#"+inputId),status=$("#"+statusId);
    if(!input||!status)return;
    input.addEventListener("input",()=>{
      const v=input.value.toLowerCase().replace(/[^a-z0-9_]/g,"");
      if(input.value!==v)input.value=v;
      if(v.length<3){status.textContent=v.length?t("username_invalid"):"";status.className="username-status"+(v.length?" err":"");if(onValid)onValid(false);return;}
      status.textContent=t("username_checking");status.className="username-status checking";
      if(_usernameCheckTimer)clearTimeout(_usernameCheckTimer);
      _usernameCheckTimer=setTimeout(async()=>{
        const base=apiBase();const token=await getToken();
        if(!base||!token){status.textContent="";return;}
        try{
          const r=await fetch(base+"/api/users/check-username?username="+encodeURIComponent(v),{headers:{"Authorization":"Bearer "+token}});
          const d=await r.json();
          if(d.available){status.textContent=t("username_ok");status.className="username-status ok";if(onValid)onValid(true);}
          else{status.textContent=d.error==="invalid"?t("username_invalid"):t("username_taken");status.className="username-status err";if(onValid)onValid(false);}
        }catch(e){status.textContent="";if(onValid)onValid(false);}
      },500);
    });
  }

  // ── Unified signup-setup: rolle/workplace (trin 1) → bekræft (trin 2) ──
  const ROLE_META=[
    {id:"chef",emoji:"👨‍🍳",color:"#1F7A4D",soft:"rgba(31,122,77,.14)",items:["preset_main","preset_starter","preset_dessert","preset_mise","preset_sauce"]},
    {id:"waiter",emoji:"🤵",color:"#C9762F",soft:"rgba(201,118,47,.14)",items:["preset_cover","preset_bottle","preset_coffee","preset_tableset","preset_bill"]},
    {id:"bartender",emoji:"🍸",color:"#2E6FA8",soft:"rgba(46,111,168,.14)",items:["preset_cocktail","preset_bottle","preset_welcome","preset_snaps","preset_coffee_art"]},
    {id:"barista",emoji:"☕",color:"#8A2E3F",soft:"rgba(138,46,63,.14)",items:["preset_coffee_art","preset_coffee","preset_water","preset_cocktail","preset_welcome"]},
  ];
  function _roleLabel(id2){
    const k="su_role_"+id2,ks="su_role_"+id2+"_sub";
    return {name:t(k),sub:t(ks)};
  }
  let _suUsernameValid=false,_suSelectedRole=null,_suContext="presignup";
  function _renderSuRoles(){
    const list=$("#suRoleList");if(!list)return;
    list.innerHTML=ROLE_META.map(r=>{
      const lbl=_roleLabel(r.id);
      return '<button type="button" class="su-role-row'+(_suSelectedRole===r.id?" active":"")+'" data-role="'+r.id+'">'
        +'<div class="su-role-ico" style="background:'+r.soft+';color:'+r.color+'">'+r.emoji+'</div>'
        +'<div class="su-role-txt"><div class="su-role-name">'+esc(lbl.name)+'</div><div class="su-role-sub">'+esc(lbl.sub)+'</div></div>'
        +'<span class="su-role-chev">›</span>'
      +'</button>';
    }).join("");
    list.querySelectorAll("[data-role]").forEach(b=>b.addEventListener("click",()=>{_suSelectedRole=b.dataset.role;_renderSuRoles();haptic(15);}));
  }
  function maybeShowSignupSetup(profile,context){
    if(profile&&profile.username)return;
    _suContext=context||"presignup";
    const scrim=$("#signupSetupScrim");if(!scrim){if(_suContext==="presignup"){hideAuthScreen();startApp();}return;}
    $("#suTitle1").textContent=t("su_title1");$("#suSub1").textContent=t("su_sub1");
    $("#suUsername").value="";
    $("#suWorkplace").value=(profile&&profile.workplace)||"";
    _suSelectedRole=null;_suUsernameValid=false;
    const roleMatch=ROLE_META.find(r=>_roleLabel(r.id).name===(profile&&profile.profession));
    if(roleMatch)_suSelectedRole=roleMatch.id;
    _renderSuRoles();
    $("#suStep1").style.display="";$("#suStep2").style.display="none";
    $("#suUsernameStatus").textContent="";$("#suUsernameStatus").className="username-status";
    scrim.classList.add("open");
    setTimeout(()=>{const el=$("#suUsername");if(el)el.focus();},250);
  }
  function _afterSignupSetup(){
    if(_suContext==="presignup"){hideAuthScreen();startApp();}
    else{
      const initEl=$("#profileInitial");
      const v=($("#suUsername").value||"").trim();
      if(initEl&&v)initEl.textContent=v.charAt(0).toUpperCase();
    }
  }
  function setupSignupSetupModal(){
    setupUsernameInput("suUsername","suUsernameStatus",v=>{_suUsernameValid=v;});
    $("#suContinue").addEventListener("click",()=>{
      const v=($("#suUsername").value||"").trim();
      if(!v||v.length<3||!_suUsernameValid){const s=$("#suUsernameStatus");s.textContent=t("su_username_needed");s.className="username-status err";$("#suUsername").focus();return;}
      if(!_suSelectedRole){showToast(t("su_role_needed"));return;}
      const lbl=_roleLabel(_suSelectedRole);
      $("#suTitle2").textContent=t("su_title2");$("#suSub2").textContent=t("su_sub2");
      $("#suAvatar").textContent=v.charAt(0).toUpperCase();
      $("#suRowUserVal").textContent="@"+v;
      $("#suRowWorkVal").textContent=($("#suWorkplace").value||"").trim()||"—";
      $("#suRowRoleVal").textContent=lbl.name;
      $("#suStep1").style.display="none";$("#suStep2").style.display="";
      haptic(15);
    });
    document.querySelectorAll("[data-su-edit]").forEach(b=>b.addEventListener("click",()=>{
      $("#suStep1").style.display="";$("#suStep2").style.display="none";
    }));
    $("#suBack").addEventListener("click",()=>{$("#suStep1").style.display="";$("#suStep2").style.display="none";});
    $("#suSave").addEventListener("click",async()=>{
      const btn=$("#suSave");btn.disabled=true;
      const username=($("#suUsername").value||"").trim();
      const workplace=($("#suWorkplace").value||"").trim();
      const roleLbl=_roleLabel(_suSelectedRole||"chef").name;
      const base=apiBase();const token=await getToken();
      if(!base||!token){
        btn.disabled=false;
        showToast(lang==="da"?"Ingen forbindelse — prøv igen":"No connection — try again");
        return;
      }
      try{
        const r=await fetch(base+"/api/user/update",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({username,workplace,profession:roleLbl})});
        const d=await r.json();
        if(!r.ok||d.error){
          btn.disabled=false;
          if(d.error==="username_taken"){
            $("#suStep1").style.display="";$("#suStep2").style.display="none";
            const s=$("#suUsernameStatus");s.textContent=t("username_taken");s.className="username-status err";
          }else{
            console.error("su/save failed",r.status,d.error);
            showToast(lang==="da"?"Kunne ikke gemme — prøv igen":"Couldn't save — try again");
          }
          return;
        }
      }catch(e){
        btn.disabled=false;
        console.error("su/save network error",e.message);
        showToast(lang==="da"?"Ingen forbindelse — prøv igen":"No connection — try again");
        return;
      }
      // Seed startertællere for den valgte rolle (kun hvis brugeren ikke har nogen endnu)
      const pack=ROLE_META.find(r=>r.id===_suSelectedRole);
      if(pack&&!state.counters.length){
        pack.items.forEach(pid=>{
          const item=CATALOG.find(c=>c.id===pid);if(!item)return;
          const label=lang==="en"?item.en:item.da;
          state.counters.push({id:item.id,label,count:0,unit:"stk",cat:item.cat,subs:[],suggest:seedFor(label)});
        });
        save();
        track("role_pack",{r:_suSelectedRole});
      }
      btn.disabled=false;
      $("#signupSetupScrim").classList.remove("open");
      showToast(lang==="da"?"Din konto er klar — god service! 🎉":"Your account is ready — have a great service! 🎉");
      haptic(40);
      _afterSignupSetup();
    });
  }

  function setupProfileModal(){
    const profileBtn=$("#profileBtn");
    if(profileBtn)profileBtn.addEventListener("click",()=>switchTab("profile"));
    const careerStrip=$("#profileCareerStrip");
    if(careerStrip)careerStrip.addEventListener("click",()=>switchTab("stats"));
    let profileUsernameValid=true;
    setupUsernameInput("profileUsername","profileUsernameStatus",v=>{profileUsernameValid=v;});
    const saveBtn=$("#profileSave");
    if(saveBtn)saveBtn.addEventListener("click",async()=>{
      const nick=($("#profileNick").value||"").trim();
      const prof=($("#profileProf").value||"").trim();
      const username=($("#profileUsername").value||"").trim();
      const base=apiBase();const token=await getToken();
      if(!base||!token){
        showToast(lang==="da"?"Ingen forbindelse — prøv igen":"No connection — try again");
        return;
      }
      try{
        const body={nickname:nick,profession:prof};
        if(username)body.username=username;
        const r=await fetch(base+"/api/user/update",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify(body)});
        const d=await r.json();
        if(!r.ok||d.error){
          if(d.error==="username_taken"){const s=$("#profileUsernameStatus");s.textContent=t("username_taken");s.className="username-status err";}
          else{console.error("profile/save failed",r.status,d.error);showToast(lang==="da"?"Kunne ikke gemme — prøv igen":"Couldn't save — try again");}
          return;
        }
      }catch(e){
        console.error("profile/save network error",e.message);
        showToast(lang==="da"?"Ingen forbindelse — prøv igen":"No connection — try again");
        return;
      }
      showToast(lang==="da"?"Profil gemt":"Profile saved");
    });
  }

  // ---- shift ----
  const SHIFT_KEY="mise_shift";
  let shiftTimerInterval=null,shiftPhotoDataUrl=null,_shiftNudgeShown=false;

  function getShift(){try{return JSON.parse(localStorage.getItem(SHIFT_KEY)||"null");}catch(e){return null;}}
  function saveShift(s){if(s)localStorage.setItem(SHIFT_KEY,JSON.stringify(s));else{localStorage.removeItem(SHIFT_KEY);_shiftNudgeShown=false;}}
  function recordShiftEnd(sh){
    if(!sh||!sh.startedAt)return;
    const endedAt=Date.now();
    const durationMs=endedAt-new Date(sh.startedAt).getTime();
    const snapMap={};
    (sh.snap||[]).forEach(sc=>{snapMap[sc.id]={count:sc.count,subs:{}};(sc.subs||[]).forEach(ss=>snapMap[sc.id].subs[ss.id]=ss.count);});
    const entries=[];
    state.counters.forEach(c=>{
      const snap=snapMap[c.id]||{count:0,subs:{}};
      if(c.subs.length){
        c.subs.forEach(s=>{const sv=snap.subs[s.id]||0;entries.push({counterId:c.id,subId:s.id,label:tLabel(c.label)+" · "+tLabel(s.name),unit:c.unit||"stk",snapCount:sv,endCount:s.count,delta:s.count-sv});});
      } else {
        const sv=snap.count||0;entries.push({counterId:c.id,label:tLabel(c.label),unit:c.unit||"stk",snapCount:sv,endCount:c.count,delta:c.count-sv});
      }
    });
    if(!Array.isArray(state.shiftHistory))state.shiftHistory=[];
    track("shift_end",{min:Math.round(durationMs/60000)});
    state.shiftHistory.unshift({id:id(),startedAt:sh.startedAt,endedAt,durationMs,entries});
    if(state.shiftHistory.length>365)state.shiftHistory=state.shiftHistory.slice(0,365);
    save();
  }
  function totalWorkMs(){return(state.shiftHistory||[]).reduce((a,s)=>a+s.durationMs,0)+(getShift()?Date.now()-new Date(getShift().startedAt).getTime():0);}
  function fmtWorkTime(ms){
    const h=Math.floor(ms/3600000),m=Math.floor((ms%3600000)/60000);
    return h+"t "+m+"m";
  }
  let _editShiftIdx=null;
  function openShiftEdit(idx){
    _editShiftIdx=idx;
    const s=state.shiftHistory[idx];if(!s)return;
    const d=new Date(s.startedAt);
    const dateStr=d.toLocaleDateString(lang==="da"?"da-DK":"en-GB",{weekday:"long",day:"numeric",month:"long"});
    document.getElementById("shiftEditTitle").textContent=dateStr;
    document.getElementById("shiftEditMeta").textContent=fmtWorkTime(s.durationMs)+" · "+new Date(s.startedAt).toLocaleTimeString(lang==="da"?"da-DK":"en-GB",{hour:"2-digit",minute:"2-digit"})+"–"+new Date(s.endedAt).toLocaleTimeString(lang==="da"?"da-DK":"en-GB",{hour:"2-digit",minute:"2-digit"});
    document.getElementById("shiftEditSave").textContent=lang==="da"?"Gem ændringer":"Save changes";
    document.getElementById("shiftEditCancel").textContent=lang==="da"?"Annuller":"Cancel";
    const entriesEl=document.getElementById("shiftEditEntries");entriesEl.innerHTML="";
    (s.entries||[]).forEach((e,ei)=>{
      const row=document.createElement("div");row.className="shift-edit-row";
      const lbl=document.createElement("div");lbl.className="shift-edit-label";
      lbl.innerHTML=esc(e.label)+'<div class="shift-edit-unit">'+esc(e.unit)+'</div>';
      const inp=document.createElement("input");inp.className="shift-edit-input";inp.type="number";inp.min="0";inp.step=e.unit==="stk"?"1":"0.1";inp.value=e.delta;inp.dataset.ei=ei;
      row.appendChild(lbl);row.appendChild(inp);entriesEl.appendChild(row);
    });
    document.getElementById("shiftEditScrim").classList.add("open");
  }
  function closeShiftEdit(){document.getElementById("shiftEditScrim").classList.remove("open");_editShiftIdx=null;}
  document.getElementById("shiftEditSave").addEventListener("click",()=>{
    if(_editShiftIdx===null)return;
    const s=state.shiftHistory[_editShiftIdx];if(!s)return;
    document.querySelectorAll("#shiftEditEntries .shift-edit-input").forEach(inp=>{
      const ei=+inp.dataset.ei;const e=s.entries[ei];if(!e)return;
      const newDelta=parseFloat(inp.value)||0;
      const diff=newDelta-e.delta;
      if(diff===0)return;
      const c=state.counters.find(x=>x.id===e.counterId);if(!c)return;
      if(e.subId){const sub=c.subs.find(x=>x.id===e.subId);if(sub)sub.count=parseFloat((sub.count+diff).toFixed(2));}
      else{c.count=parseFloat((c.count+diff).toFixed(2));}
      e.delta=newDelta;e.endCount=e.snapCount+newDelta;
    });
    save();renderVagt();renderCounters();renderCareer();_buildVagtActivity(document.getElementById("historyShifts"));closeShiftEdit();
    showToast(lang==="da"?"Vagt opdateret":"Shift updated");
  });
  document.getElementById("shiftEditCancel").addEventListener("click",closeShiftEdit);
  document.getElementById("shiftEditDelete").addEventListener("click",()=>{
    if(_editShiftIdx===null)return;
    state.shiftHistory.splice(_editShiftIdx,1);
    save();_buildVagtActivity(document.getElementById("historyShifts"));renderLogView();closeShiftEdit();
    showToast(lang==="da"?"Vagt slettet":"Shift deleted");
  });

  function fmtDuration(ms){
    const totalMin=Math.floor(ms/60000);
    const h=Math.floor(totalMin/60),m=totalMin%60;
    return h?h+"t "+m+"min":m+"min";
  }

  function startShift(backdateMs){
    track("shift_start",backdateMs?{backdateMin:Math.round(backdateMs/60000)}:undefined);
    localStorage.setItem("mise_vagt_detail","1");
    const snap=state.counters.map(c=>({id:c.id,count:c.count,subs:c.subs.map(s=>({id:s.id,count:s.count}))}));
    saveShift({startedAt:new Date(Date.now()-(backdateMs||0)).toISOString(),snap});
    _shiftNudgeShown=false;
    renderShiftBar();
  }

  // ── Glemte du at starte vagten? Spørg når der logges uden en aktiv vagt ──
  function maybeNudgeShiftStart(){
    if(getShift()||_shiftNudgeShown)return;
    _shiftNudgeShown=true;
    setTimeout(()=>{const scrim=$("#shiftNudgeScrim");if(scrim)scrim.classList.add("open");},700);
  }
  function setupShiftNudge(){
    const scrim=$("#shiftNudgeScrim");if(!scrim)return;
    scrim.querySelectorAll(".shift-nudge-chip").forEach(btn=>{
      btn.addEventListener("click",()=>{
        const min=parseInt(btn.dataset.min,10)||0;
        startShift(min*60000);
        scrim.classList.remove("open");
        renderVagt();
        showToast(lang==="da"?"Vagt startet":"Shift started");
        haptic(30);
      });
    });
    const dismiss=$("#shiftNudgeDismiss");
    if(dismiss)dismiss.addEventListener("click",()=>scrim.classList.remove("open"));
  }

  function renderShiftBar(){
    const shift=getShift();
    const bar=$("#shiftBar"),startBtn=$("#shiftStartBtn");
    if(!bar||!startBtn)return;
    const onVagt=document.getElementById("view-vagt")&&document.getElementById("view-vagt").classList.contains("active");
    if(onVagt){bar.style.display="none";startBtn.style.display="none";return;}
    if(shift){
      bar.classList.add("active");startBtn.style.display="none";
      if(shiftTimerInterval)clearInterval(shiftTimerInterval);
      function _fmtShift(ms){const s=Math.floor(ms/1000),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;return h>0?h+":"+String(m).padStart(2,"0")+":"+String(sec).padStart(2,"0"):m+":"+String(sec).padStart(2,"0");}
      shiftTimerInterval=setInterval(()=>{
        const ms=Date.now()-new Date(shift.startedAt).getTime();
        const timer=$("#shiftTimer");if(timer)timer.textContent=_fmtShift(ms);
      },1000);
      // initial
      const ms=Date.now()-new Date(shift.startedAt).getTime();
      const timer=$("#shiftTimer");if(timer)timer.textContent=_fmtShift(ms);
    }else{
      bar.classList.remove("active");startBtn.style.display="none";
      if(shiftTimerInterval){clearInterval(shiftTimerInterval);shiftTimerInterval=null;}
    }
  }

  async function generateShiftSummary(){
    const shift=getShift();if(!shift)return;
    const base=apiBase();const token=await getToken();if(!base||!token)return;
    const cap=$("#shiftCaption");
    if(cap){cap.disabled=true;cap.placeholder=t("shift_ai_loading");}
    const durationMs=Date.now()-new Date(shift.startedAt).getTime();
    const snapMap={};(shift.snap||[]).forEach(c=>{snapMap[c.id]={count:c.count,subs:{}};(c.subs||[]).forEach(s=>{snapMap[c.id].subs[s.id]=s.count;});});
    const changes=[];
    state.counters.forEach(c=>{
      const snap=snapMap[c.id]||{count:0,subs:{}};
      if(c.subs.length){c.subs.forEach(s=>{const was=snap.subs[s.id]||0;const diff=s.count-was;if(diff>0)changes.push({label:tLabel(c.label)+(s.name?"/"+tLabel(s.name):""),delta:diff});});}
      else{const diff=c.count-(snap.count||0);if(diff>0)changes.push({label:tLabel(c.label),delta:diff});}
    });
    try{
      const r=await fetch(base+"/api/shift/summary",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({changes,durationMs,lang})});
      const d=await r.json();
      if(!r.ok||!d.summary)throw new Error(d.error||"no summary");
      if(cap){cap.disabled=false;cap.placeholder=t("shift_caption_ph");cap.value=d.summary;cap.focus();}
    }catch(e){
      if(cap){cap.disabled=false;cap.placeholder=t("shift_caption_ph");}
      showToast(t("shift_ai_err"));
    }
  }

  async function generateDishDescription(){
    if(!_currentDish)return;
    const base=apiBase();const token=await getToken();if(!base||!token)return;
    const btn=$("#dishDescAiBtn");const lbl=$("#dishDescAiBtnLbl");
    if(btn){btn.disabled=true;}if(lbl)lbl.textContent=t("lab_ai_desc_loading");
    const dishSnap={
      name:(document.getElementById("deName")||{}).value||_currentDish.name||"",
      data:Object.assign({},_currentDish.data,{
        concept:(document.getElementById("deConcept")||{}).value||_currentDish.data.concept||"",
        technique:(document.getElementById("deTechnique")||{}).value||_currentDish.data.technique||"",
        season:(document.getElementById("deSeason")||{}).value||_currentDish.data.season||""
      })
    };
    try{
      const r=await fetch(base+"/api/lab/dishes/description",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({dish:dishSnap,lang})});
      const d=await r.json();
      if(!r.ok||!d.description)throw new Error(d.error||"no description");
      const pl=document.getElementById("dePlating");if(pl){pl.value=d.description;pl.focus();if(_currentDish.data)_currentDish.data.plating=d.description;markDirty();}
    }catch(e){showToast(t("lab_ai_desc_err"));}
    finally{if(btn){btn.disabled=false;}if(lbl)lbl.textContent=t("lab_ai_desc");}
  }

  function _shiftChanges(shift){
    const snapMap={};(shift.snap||[]).forEach(c=>{snapMap[c.id]={count:c.count,subs:{}};(c.subs||[]).forEach(s=>{snapMap[c.id].subs[s.id]=s.count;});});
    const changes=[];
    state.counters.forEach(c=>{
      const snap=snapMap[c.id]||{count:0,subs:{}};
      if(c.subs.length){
        c.subs.forEach(s=>{const was=snap.subs[s.id]||0;const diff=s.count-was;if(diff>0)changes.push({label:tLabel(c.label)+(s.name?"/"+tLabel(s.name):""),delta:diff});});
      }else{
        const diff=c.count-(snap.count||0);if(diff>0)changes.push({label:tLabel(c.label),delta:diff});
      }
    });
    return changes;
  }
  function _shiftTotalsHtml(changes){
    return changes.length
      ?changes.map(c=>'<div class="shift-total-row"><span class="shift-total-lbl">'+esc(c.label)+'</span><span class="shift-total-val">+'+fmtCount(c.delta)+'</span></div>').join("")
      :'<p class="muted">'+esc(t("shift_no_data"))+'</p>';
  }
  function _renderShiftStep1Totals(){
    const shift=getShift();if(!shift)return;
    const el=$("#shiftStep1Totals");if(el)el.innerHTML=_shiftTotalsHtml(_shiftChanges(shift));
  }
  // Trin 1: log hvad du lavede, før opsummeringen
  function openShiftModal(){
    const shift=getShift();if(!shift)return;
    const durationMs=Date.now()-new Date(shift.startedAt).getTime();
    const durEl=$("#shiftDuration");if(durEl)durEl.textContent=t("shift_duration",fmtDuration(durationMs));
    const titleEl=$("#shiftModalTitle");if(titleEl)titleEl.textContent=lang==="da"?"Hvad nåede du?":"What did you get done?";
    const hint=$("#shiftLogHint");if(hint)hint.textContent=lang==="da"?"Skriv hvad du lavede på vagten — tallene opdateres med det samme. Spring over hvis alt allerede er talt.":"Write what you did during the shift — the numbers update instantly. Skip if everything is already counted.";
    const inp=$("#shiftLogIn");if(inp){inp.value="";inp.placeholder=lang==="da"?"Fx: åbnede 30 østers og lavede 12 kaffe":"E.g.: opened 30 oysters and made 12 coffees";}
    const nxt=$("#shiftStep1Next");if(nxt)nxt.textContent=lang==="da"?"Videre til opsummering":"Continue to summary";
    const cnc=$("#shiftStep1Cancel");if(cnc)cnc.textContent=lang==="da"?"Tilbage til vagten":"Back to shift";
    const s1=$("#shiftStep1"),s2=$("#shiftStep2");
    if(s1)s1.style.display="";if(s2)s2.style.display="none";
    _renderShiftStep1Totals();
    _renderShiftDishNotes();
    $("#shiftScrim").classList.add("open");
    if(inp)setTimeout(()=>inp.focus(),250);
  }
  async function _loadDishesSilent(){
    if(_labDishes.length)return;
    const base=apiBase();const token=await getToken();if(!base||!token)return;
    try{const r=await fetch(base+"/api/lab/dishes",{headers:{"Authorization":"Bearer "+token}});const d=await r.json();_labDishes=d.dishes||[];}catch(e){}
  }
  // Retter "På menu" får et note-felt i afslut-flowets trin 1
  async function _renderShiftDishNotes(){
    const wrap=$("#shiftDishNotes");if(!wrap)return;
    wrap.style.display="none";
    await _loadDishesSilent();
    const menuDishes=_labDishes.filter(d=>d.status==="menu");
    if(!menuDishes.length)return;
    const ttl=$("#sdnTitle");if(ttl)ttl.textContent=lang==="da"?"Noter til menuen":"Menu notes";
    const list=$("#sdnList");if(!list)return;
    list.innerHTML=menuDishes.slice(0,6).map(d=>'<div class="sdn-row"><div class="sdn-dish">'+esc(d.name||"")+'</div><input class="sdn-in" data-dish-note="'+esc(d.id)+'" maxlength="300" placeholder="'+esc(lang==="da"?"Hvordan gik den i service? (valgfrit)":"How did it go in service? (optional)")+'"></div>').join("");
    wrap.style.display="";
  }
  async function _saveShiftDishNotes(){
    const inputs=document.querySelectorAll("#sdnList [data-dish-note]");
    if(!inputs.length)return;
    const base=apiBase();const token=await getToken();if(!base||!token)return;
    let saved=0;
    for(const inp of inputs){
      const text=(inp.value||"").trim();if(!text)continue;
      const dish=_labDishes.find(d=>d.id===inp.dataset.dishNote);if(!dish)continue;
      dish.data=dish.data||{};
      (dish.data.serviceNotes=dish.data.serviceNotes||[]).push({ts:Date.now(),text});
      if(dish.data.serviceNotes.length>200)dish.data.serviceNotes=dish.data.serviceNotes.slice(-200);
      inp.value="";saved++;
      try{fetch(base+"/api/lab/dishes/"+dish.id,{method:"PUT",keepalive:true,headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({data:dish.data})});}catch(e){}
    }
    if(saved)showToast(lang==="da"?(saved===1?"Service-note gemt ✓":saved+" service-noter gemt ✓"):(saved===1?"Service note saved ✓":saved+" service notes saved ✓"));
  }
  async function runShiftLogAdd(text){
    text=(text||"").trim();if(!text)return;
    const inp=$("#shiftLogIn"),spin=$("#shiftLogSpin"),btn=$("#shiftLogAdd");
    let actions=confidentLocalActions(text)||[];
    if(!actions.length){
      if(spin)spin.classList.add("on");if(btn)btn.disabled=true;if(inp)inp.disabled=true;
      try{actions=await parseLog(text);}catch(e){console.warn("shift log parse failed:",e);}
      if(!actions.length)actions=localParse(text);
      if(spin)spin.classList.remove("on");if(btn)btn.disabled=false;if(inp)inp.disabled=false;
    }
    if(!actions.length){showToast(lang==="da"?"Forstod ikke — prøv igen":"Couldn\u2019t parse — try again");if(inp)inp.focus();return;}
    undoSnapshot=clone(state);
    const summary=[],syncItems=[],cats=[];
    actions.forEach(a=>applyOne(a,summary,syncItems,cats));
    if(inp)inp.value="";
    save();_updateVagtAfterLog();renderCounters();renderCareer();
    if(summary.length){addLogEntry(summary.join(" · "),null,cats[0]);haptic(40);deferSync(syncItems,null,summary.join(" · "));}
    checkBadges();checkRecords();
    _renderShiftStep1Totals();
    if(inp)inp.focus();
  }
  // Delbart vagt-kort: mørk gradient, tallene i Fraunces, klar til Stories
  async function shareShiftCard(){
    const shift=getShift();if(!shift)return;
    track("share_card");
    const changes=_shiftChanges(shift).sort((a,b)=>b.delta-a.delta);
    const durationMs=Date.now()-new Date(shift.startedAt).getTime();
    try{await document.fonts.load('600 120px Fraunces');await document.fonts.load('700 64px Fraunces');}catch(e){}
    const W=1080,H=1350;
    const cv=document.createElement("canvas");cv.width=W;cv.height=H;
    const ctx=cv.getContext("2d");
    const g=ctx.createLinearGradient(0,0,W,H);
    g.addColorStop(0,"#2E0E15");g.addColorStop(.55,"#54202E");g.addColorStop(1,"#7A2A3C");
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    ctx.fillStyle="rgba(255,255,255,.06)";
    ctx.beginPath();ctx.arc(W-80,120,260,0,7);ctx.fill();
    const dateStr=new Date().toLocaleDateString(lang==="da"?"da-DK":"en-GB",{weekday:"long",day:"numeric",month:"long"});
    ctx.fillStyle="rgba(255,255,255,.65)";
    ctx.font="700 40px Inter, sans-serif";ctx.textAlign="center";
    ctx.fillText(dateStr.toUpperCase(),W/2,150);
    ctx.fillStyle="#fff";
    ctx.font="600 150px Fraunces, serif";
    ctx.fillText(fmtDuration(durationMs),W/2,330);
    ctx.font="700 34px Inter, sans-serif";ctx.fillStyle="rgba(255,255,255,.55)";
    ctx.fillText((lang==="da"?"PÅ VAGT":"ON SHIFT"),W/2,390);
    let y=520;
    ctx.textAlign="left";
    changes.slice(0,5).forEach(c=>{
      ctx.fillStyle="#FFB36B";
      ctx.font="700 64px Fraunces, serif";
      ctx.fillText("+"+fmtCount(c.delta),120,y);
      ctx.fillStyle="rgba(255,255,255,.9)";
      ctx.font="500 44px Inter, sans-serif";
      ctx.fillText(c.label.slice(0,26),320,y-4);
      y+=110;
    });
    if(!changes.length){
      ctx.fillStyle="rgba(255,255,255,.7)";ctx.font="500 44px Inter, sans-serif";ctx.textAlign="center";
      ctx.fillText(lang==="da"?"En stille vagt — de findes også":"A quiet one — those exist too",W/2,600);
      ctx.textAlign="left";
    }
    const total=changes.reduce((a,c)=>a+c.delta,0);
    if(total>0){
      ctx.strokeStyle="rgba(255,255,255,.18)";ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(120,y+10);ctx.lineTo(W-120,y+10);ctx.stroke();
      ctx.fillStyle="#FF6B8A";ctx.font="600 96px Fraunces, serif";
      ctx.fillText(fmtNum(total),120,y+140);
      ctx.fillStyle="rgba(255,255,255,.6)";ctx.font="700 34px Inter, sans-serif";
      ctx.fillText((lang==="da"?"I ALT":"TOTAL"),320,y+130);
    }
    ctx.fillStyle="rgba(255,255,255,.5)";
    ctx.font="700 36px Inter, sans-serif";ctx.textAlign="center";
    ctx.fillText("Craft Tracker",W/2,H-70);
    const blob=await new Promise(r=>cv.toBlob(r,"image/png"));
    if(!blob)return;
    const file=new File([blob],"vagt.png",{type:"image/png"});
    if(navigator.canShare&&navigator.canShare({files:[file]})){
      try{await navigator.share({files:[file]});return;}catch(e){if(e&&e.name==="AbortError")return;}
    }
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="vagt.png";a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),5000);
  }

  // Trin 2: opsummering + post
  function _showShiftSummaryStep(){
    const shift=getShift();if(!shift)return;
    const s1=$("#shiftStep1"),s2=$("#shiftStep2");
    if(s1)s1.style.display="none";if(s2)s2.style.display="";
    const titleEl=$("#shiftModalTitle");if(titleEl)titleEl.textContent=t("shift_title");
    const totalsEl=$("#shiftTotals");if(totalsEl)totalsEl.innerHTML=_shiftTotalsHtml(_shiftChanges(shift));
    const capEl=$("#shiftCaption");if(capEl)capEl.value="";
    shiftPhotoDataUrl=null;
    const thumb=$("#shiftPhotoThumb");if(thumb){thumb.src="";thumb.style.display="none";}
    generateShiftSummary();
  }

  async function postShift(){
    const shift=getShift();if(!shift)return;
    const caption=($("#shiftCaption").value||"").trim();
    const snapMap={};(shift.snap||[]).forEach(c=>{snapMap[c.id]={count:c.count,subs:{}};(c.subs||[]).forEach(s=>{snapMap[c.id].subs[s.id]=s.count;});});
    const changes=[];
    state.counters.forEach(c=>{
      const snap=snapMap[c.id]||{count:0,subs:{}};
      if(c.subs.length){c.subs.forEach(s=>{const was=snap.subs[s.id]||0;const diff=s.count-was;if(diff>0)changes.push({label:c.label,delta:diff});});}
      else{const diff=c.count-(snap.count||0);if(diff>0)changes.push({label:c.label,delta:diff});}
    });
    if(!changes.length){showToast(lang==="da"?"Intet logget i vagten — tæl noget før du poster":"Nothing logged in this shift");return;}
    const btn=$("#shiftFeedPost");if(btn){btn.disabled=true;btn.textContent="…";}

    // upload photo if any
    let imageUrl=null;
    if(shiftPhotoDataUrl){
      const base=apiBase();const token=await getToken();
      if(base&&token){
        try{
          const bar=$("#uploadBar"),fill=$("#uploadBarFill");
          if(bar)bar.style.display="block";if(fill)fill.style.width="40%";
          const res=await fetch(base+"/api/upload-photo",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({dataUrl:shiftPhotoDataUrl})});
          if(fill)fill.style.width="100%";setTimeout(()=>{if(bar)bar.style.display="none";},350);
          const d=await res.json();imageUrl=d.url||null;
        }catch(e){}
      }
    }

    const total=changes.reduce((a,c)=>a+c.delta,0);
    const primaryCat=changes.sort((a,b)=>b.delta-a.delta)[0];
    const summaryParts=changes.map(c=>"+"+c.delta+" "+tLabel(c.label));
    const summary=(caption||summaryParts.join(", ")).slice(0,200);

    const base=apiBase();const token=await getToken();
    let posted=false;
    if(base&&token){
      try{
        const r=await fetch(base+"/api/log-entry",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({categoryLabel:primaryCat.label,delta:total,imageUrl,summary})});
        if(r.ok)posted=true;
      }catch(e){}
    }

    if(btn){btn.disabled=false;btn.textContent=t("shift_post_feed");}
    if(!posted){showToast(lang==="da"?"Noget gik galt — prøv igen":"Something went wrong, try again");return;}

    haptic(60);
    const ms2=Date.now()-new Date(shift.startedAt).getTime();
    const dur2=Math.floor(ms2/3600000)+"t "+Math.floor((ms2%3600000)/60000)+"m";
    const parts2=changes.map(c=>"+"+c.delta+" "+tLabel(c.label));
    const logTxt2=(lang==="da"?"Vagt postet":"Shift posted")+": "+parts2.join(", ")+" ("+dur2+")";
    if(!Array.isArray(state.log))state.log=[];
    state.log.unshift({ts:Date.now(),text:logTxt2});
    if(state.log.length>2000)state.log.length=2000;
    save();renderLogView();
    $("#shiftScrim").classList.remove("open");
    recordShiftEnd(getShift());saveShift(null);renderShiftBar();renderVagt();
    showToast(lang==="da"?"Vagt postet til feed!":"Shift posted to feed!");setTimeout(()=>requestNotifPermission(),1500);
    feedCursor=null;
    const feedView=$("#view-feed");if(feedView&&feedView.classList.contains("active"))loadFeed(false);
  }

  function setupShift(){
    renderShiftBar();
    const startBtn=$("#shiftStartBtn");if(startBtn)startBtn.addEventListener("click",startShift);
    const endBtn=$("#shiftEndBtn");if(endBtn)endBtn.addEventListener("click",openShiftModal);
    const postBtn=$("#shiftPost");if(postBtn)postBtn.addEventListener("click",()=>{
      const sh=getShift();
      if(sh){
        const snapMap={};(sh.snap||[]).forEach(c=>{snapMap[c.id]={count:c.count,subs:{}};(c.subs||[]).forEach(s=>{snapMap[c.id].subs[s.id]=s.count;});});
        const parts=[];
        state.counters.forEach(c=>{
          const snap=snapMap[c.id]||{count:0,subs:{}};
          if(c.subs.length){c.subs.forEach(s=>{const d=s.count-(snap.subs[s.id]||0);if(d>0)parts.push("+"+d+" "+tLabel(s.name||c.label));});}
          else{const d=c.count-(snap.count||0);if(d>0)parts.push("+"+d+" "+tLabel(c.label));}
        });
        const ms=Date.now()-new Date(sh.startedAt).getTime();
        const dur=Math.floor(ms/3600000)+"t "+Math.floor((ms%3600000)/60000)+"m";
        const txt=(lang==="da"?"Vagt afsluttet":"Shift ended")+(parts.length?" · "+parts.join(", "):"")+" ("+dur+")";
        if(!Array.isArray(state.log))state.log=[];
        state.log.unshift({ts:Date.now(),text:txt});
        if(state.log.length>2000)state.log.length=2000;
        save();renderLogView();
      }
      recordShiftEnd(getShift());saveShift(null);renderShiftBar();renderVagt();$("#shiftScrim").classList.remove("open");showToast(lang==="da"?"Vagt afsluttet":"Shift ended");setTimeout(()=>requestNotifPermission(),1500);
    });
    const feedPostBtn=$("#shiftFeedPost");if(feedPostBtn)feedPostBtn.addEventListener("click",postShift);
    const shareImgBtn=$("#shiftShareImg");
    if(shareImgBtn){shareImgBtn.textContent="📸 "+(lang==="da"?"Del som billede":"Share as image");shareImgBtn.addEventListener("click",shareShiftCard);}
    const slAdd=$("#shiftLogAdd"),slIn=$("#shiftLogIn");
    if(slAdd&&slIn)slAdd.addEventListener("click",()=>runShiftLogAdd(slIn.value));
    if(slIn)slIn.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();runShiftLogAdd(slIn.value);}});
    const slNext=$("#shiftStep1Next");if(slNext)slNext.addEventListener("click",()=>{_saveShiftDishNotes();_showShiftSummaryStep();});
    const slCancel=$("#shiftStep1Cancel");if(slCancel)slCancel.addEventListener("click",()=>$("#shiftScrim").classList.remove("open"));
    const discardBtn=$("#shiftDiscard");
    if(discardBtn)discardBtn.addEventListener("click",()=>{saveShift(null);renderShiftBar();renderVagt();$("#shiftScrim").classList.remove("open");});
    // shift photo picker
    const shiftPhotoBtn=$("#shiftPhotoBtn"),shiftPhotoInput=$("#shiftPhotoInput"),shiftThumb=$("#shiftPhotoThumb");
    if(shiftPhotoBtn&&shiftPhotoInput){
      shiftPhotoBtn.addEventListener("click",()=>shiftPhotoInput.click());
      shiftPhotoInput.addEventListener("change",async()=>{
        const file=shiftPhotoInput.files[0];if(!file)return;
        if(file.size>20*1024*1024){showToast(lang==="da"?"For stort":"Too large");return;}
        const url=await resizeImage(file,1200);
        shiftPhotoDataUrl=url;
        if(shiftThumb){shiftThumb.src=url;shiftThumb.style.display="block";}
      });
      if(shiftThumb)shiftThumb.addEventListener("click",()=>{shiftPhotoDataUrl=null;shiftThumb.src="";shiftThumb.style.display="none";shiftPhotoInput.value="";});
    }
  }

  // ---- feed ----
  let feedCursor=null,feedLoading=false,activeCommentEntry=null;

  function timeAgo(iso){
    const ms=Date.now()-new Date(iso).getTime();
    const m=Math.floor(ms/60000);
    if(m<1)return t("feed_ago_now");
    if(m<60)return t("feed_ago_min",m);
    const h=Math.floor(m/60);
    if(h<24)return t("feed_ago_h",h);
    return t("feed_ago_day",Math.floor(h/24));
  }

  function feedEntryHtml(e){
    const initial=(e.nickname||e.username||"?").charAt(0).toUpperCase();
    const catLabel=lang==="en"?(e.categoryEn||e.category||""):e.category||"";
    const numStr=(e.delta>0?"+":"")+e.delta;
    const likeIcon=e.liked?"❤️":"🤍";
    const fs=e._followStatus||"none";
    const followBtn=e.isOwn?'':('<button class="'+followBtnClass(fs)+'" data-follow="'+esc(e.userId)+'" data-follow-status="'+esc(fs)+'">'+esc(followBtnLabel(fs))+'</button>');

    if(e.imageUrl){
      // Photo-first card
      return '<div class="feed-photo-entry" data-id="'+esc(e.id)+'">'
        +'<img src="'+esc(e.imageUrl)+'" loading="lazy" alt="">'
        +'<div class="feed-photo-overlay"></div>'
        +'<div class="feed-photo-top">'
        +'<div class="feed-photo-avatar" data-profile="'+esc(e.userId)+'">'+esc(initial)+'</div>'
        +'<span class="feed-photo-nick">'+esc(e.nickname||e.username||t("lb_anon"))+(e.isOwn?' ('+t("lb_you")+')':'')+'</span>'
        +followBtn
        +'</div>'
        +'<div class="feed-photo-time">'+esc(timeAgo(e.loggedAt))+'</div>'
        +'<div class="feed-photo-bottom">'
        +((e.delta>0)?'<div class="feed-photo-num">'+esc(numStr)+'</div>':'')
        +(catLabel?'<div class="feed-photo-cat">'+esc(catLabel)+'</div>':'')
        +(e.summary?'<div class="feed-photo-caption">'+esc(e.summary)+'</div>':'')
        +'<div class="feed-photo-actions">'
        +'<button class="feed-photo-action'+(e.liked?" liked":"")+'" data-like="'+esc(e.id)+'">'+likeIcon+' <span class="like-count">'+e.likes+'</span></button>'
        +'<button class="feed-photo-action" data-comments="'+esc(e.id)+'">💬 <span class="comment-count">'+e.comments+'</span></button>'
        +'</div>'
        +'</div>'
        +'</div>';
    }

    // Text-only card
    return '<div class="feed-entry" data-id="'+esc(e.id)+'">'
      +'<div class="feed-entry-head">'
      +'<div class="feed-avatar" data-profile="'+esc(e.userId)+'">'+esc(initial)+'</div>'
      +'<div class="feed-meta">'
      +'<div class="feed-nick">'+esc(e.nickname||e.username||t("lb_anon"))+(e.isOwn?' <span class="lb-you">('+t("lb_you")+')</span>':'')+'</div>'
      +(e.profession?'<div class="feed-time">'+esc(e.profession)+'</div>':'')
      +'<div class="feed-time">'+esc(timeAgo(e.loggedAt))+'</div>'
      +'</div>'
      +followBtn
      +'</div>'
      +(e.summary?'<div class="feed-headline">'+esc(e.summary)+'</div>':'')
      +((e.delta>0)?'<div class="feed-stat"><span class="feed-num">'+esc(numStr)+'</span>'+(catLabel?'<span>'+esc(catLabel)+'</span>':'')+'</div>':'')
      +'<div class="feed-actions">'
      +'<button class="feed-action-btn'+(e.liked?" liked":"")+'" data-like="'+esc(e.id)+'">'+likeIcon+' <span class="like-count">'+e.likes+'</span></button>'
      +'<button class="feed-action-btn" data-comments="'+esc(e.id)+'">💬 <span class="comment-count">'+e.comments+'</span></button>'
      +'</div>'
      +'</div>';
  }

  let _followingCache={};  // userId -> 'pending'|'accepted'

  async function loadFollowRequests(){
    const banner=$("#followRequestsBanner");if(!banner)return;
    const base=apiBase();const token=await getToken();if(!base||!token){banner.style.display="none";return;}
    try{
      const r=await fetch(base+"/api/follow/requests",{headers:{"Authorization":"Bearer "+token}});
      const d=await r.json();
      const reqs=d.requests||[];
      const badge=$("#feedBadge");            // på burger-knappen
      if(badge)badge.classList.toggle("show",reqs.length>0);
      const badge3=$("#profileBadge");        // på Profil i burger-menuen
      if(badge3)badge3.classList.toggle("show",reqs.length>0);
      if(!reqs.length){banner.style.display="none";return;}
      banner.style.display="";
      banner.innerHTML='<div class="follow-req-banner"><div class="follow-req-head"><span class="follow-req-title">'+esc(t("follow_req_title"))+'</span><span style="font-size:12px;color:var(--dim)">'+reqs.length+'</span></div>'
        +reqs.map(r=>{
          const name=r.nickname||("@"+(r.username||"?"));
          const handle=r.username?"@"+r.username:"";
          return '<div class="follow-req-row" data-req-id="'+esc(r.followerId)+'">'
            +'<div class="follow-req-info"><div class="follow-req-name">'+esc(name)+'</div>'+(handle?'<div class="follow-req-handle">'+esc(handle)+'</div>':'')+'</div>'
            +'<div class="follow-req-actions">'
            +'<button class="follow-req-accept" data-req-accept="'+esc(r.followerId)+'">'+esc(t("follow_req_accept"))+'</button>'
            +'<button class="follow-req-reject" data-req-reject="'+esc(r.followerId)+'">'+esc(t("follow_req_reject"))+'</button>'
            +'</div></div>';
        }).join("")+'</div>';
      banner.addEventListener("click",async e=>{
        const acceptBtn=e.target.closest("[data-req-accept]");
        const rejectBtn=e.target.closest("[data-req-reject]");
        const id=acceptBtn?.dataset.reqAccept||rejectBtn?.dataset.reqReject;
        if(!id)return;
        const row=banner.querySelector('[data-req-id="'+id+'"]');
        if(row)row.style.opacity="0.4";
        const method=acceptBtn?"POST":"DELETE";
        const endpoint=acceptBtn?(base+"/api/follow/"+id+"/accept"):(base+"/api/follow/"+id+"/reject");
        await fetch(endpoint,{method,headers:{"Authorization":"Bearer "+token}}).catch(()=>{});
        if(acceptBtn){_followingCache[id]="accepted";}
        await loadFollowRequests();
      });
    }catch(e){banner.style.display="none";}
  }

  async function loadFeed(append){
    if(feedLoading)return;
    feedLoading=true;
    const el=$("#feedContent");if(!el)return;
    if(!append){feedCursor=null;el.innerHTML=skeletonRows(4);}
    const base=apiBase();if(!base){el.innerHTML='<div class="empty-state"><div class="empty-state-icon">🧭</div><div class="empty-state-title">'+esc(t("feed_empty"))+'</div></div>';feedLoading=false;return;}
    const token=await getToken();if(!token){feedLoading=false;return;}
    try{
      let url=base+"/api/feed";if(feedCursor)url+="?before="+encodeURIComponent(feedCursor);
      const res=await fetch(url,{headers:{"Authorization":"Bearer "+token}});
      if(!res.ok){const err=await res.json().catch(()=>({}));throw new Error(err.error||"HTTP "+res.status);}
      const d=await res.json();
      const entries=d.entries||[];

      // mark follow status from cache
      entries.forEach(e=>{e._followStatus=_followingCache[e.userId]||"none";});

      if(!entries.length&&!append){
        const emptySub=lang==="da"?"Følg kolleger eller afslut en vagt — så fyldes dit feed":"Follow colleagues or end a shift — your feed will fill up";
        el.innerHTML='<div class="empty-state"><div class="empty-state-icon">🧭</div><div class="empty-state-title">'+esc(t("feed_empty"))+'</div><div class="empty-state-sub">'+esc(emptySub)+'</div></div>';
        feedLoading=false;return;
      }
      const html=entries.map(feedEntryHtml).join("");
      const loadMoreBtn='<button class="feed-load-more" id="feedLoadMore">'+esc(t("feed_load_more"))+'</button>';
      if(append){
        const old=el.querySelector("#feedLoadMore");if(old)old.remove();
        el.insertAdjacentHTML("beforeend",html+(entries.length===40?loadMoreBtn:""));
      }else{
        el.innerHTML=html+(entries.length===40?loadMoreBtn:"");
      }
      if(entries.length)feedCursor=entries[entries.length-1].loggedAt;
    }catch(e){
      if(!append)el.innerHTML='<div class="empty-state"><div class="empty-state-icon">⚠️</div><div class="empty-state-title">'+(lang==="da"?"Kunne ikke hente feed":"Could not load feed")+'</div><div class="empty-state-sub">'+esc(e.message||"")+'</div><button class="btn ghost btn-sm" style="margin-top:12px" onclick="window._reloadFeed&&window._reloadFeed()">Prøv igen</button></div>';
    }
    feedLoading=false;
  }

  async function toggleFollow(userId,currentStatus){
    const base=apiBase();const token=await getToken();if(!base||!token)return false;
    try{
      const unfollowing=currentStatus==="accepted"||currentStatus==="pending";
      const r=unfollowing
        ?await fetch(base+"/api/follow/"+userId,{method:"DELETE",headers:{"Authorization":"Bearer "+token}})
        :await fetch(base+"/api/follow",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({targetId:userId})});
      return r.ok;
    }catch(e){return false;}
  }

  function followBtnLabel(status){
    if(status==="accepted")return t("feed_unfollow");
    if(status==="pending")return t("feed_requested");
    return t("feed_follow");
  }
  function followBtnClass(status){
    if(status==="accepted")return "feed-follow-btn following";
    if(status==="pending")return "feed-follow-btn pending";
    return "feed-follow-btn";
  }

  async function toggleLike(entryId,btn){
    const base=apiBase();const token=await getToken();if(!base||!token)return;
    const liked=btn.classList.contains("liked");
    try{
      const method=liked?"DELETE":"POST";
      const res=await fetch(base+"/api/like/"+entryId,{method,headers:{"Authorization":"Bearer "+token}});
      const d=await res.json();
      btn.classList.toggle("liked",!liked);
      btn.querySelector(".like-count").textContent=d.likes||0;
      btn.textContent="";
      btn.insertAdjacentHTML("beforeend",(btn.classList.contains("liked")?"❤️":"🤍")+' <span class="like-count">'+((d.likes)||0)+'</span>');
    }catch(e){}
  }

  async function openComments(entryId){
    activeCommentEntry=entryId;
    const scrim=$("#commentScrim");if(!scrim)return;
    const listEl=$("#commentList");
    const titleEl=$("#commentTitle");if(titleEl)titleEl.textContent=t("feed_comments");
    listEl.innerHTML=skeletonRows(2);
    scrim.classList.add("open");
    const base=apiBase();const token=await getToken();
    if(!base||!token){listEl.innerHTML='';return;}
    try{
      const res=await fetch(base+"/api/comments/"+entryId,{headers:{"Authorization":"Bearer "+token}});
      const d=await res.json();
      renderComments(listEl,d.comments||[]);
    }catch(e){listEl.innerHTML='';}
  }

  function renderComments(el,comments){
    if(!comments.length){el.innerHTML='<p class="muted" style="padding:8px 0">'+esc(t("feed_comment_empty"))+'</p>';return;}
    el.innerHTML=comments.map(c=>'<div class="comment-row"><div class="comment-nick">'+esc(c.nickname||c.username||t("lb_anon"))+'</div><div class="comment-text">'+esc(c.text)+'</div><div class="comment-time">'+esc(timeAgo(c.createdAt))+'</div></div>').join("");
    el.scrollTop=el.scrollHeight;
  }
  // Løft kommentar-arket over tastaturet (som numtray'en), så skrivefeltet
  // ikke gemmer sig bag iOS-tastaturet når man fokuserer det.
  function syncCommentToViewport(){
    const scrim=$("#commentScrim");if(!scrim)return;
    if(!scrim.classList.contains("open")){scrim.style.paddingBottom="";return;}
    const vv=window.visualViewport;if(!vv)return;
    const keyboardH=Math.max(0,window.innerHeight-vv.height);
    scrim.style.paddingBottom=keyboardH+"px";
  }

  async function sendComment(){
    const input=$("#commentInput");const text=(input.value||"").trim();
    if(!text||!activeCommentEntry)return;
    const base=apiBase();const token=await getToken();if(!base||!token)return;
    input.disabled=true;
    try{
      const res=await fetch(base+"/api/comments/"+activeCommentEntry,{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({text})});
      const d=await res.json();
      if(!res.ok){showToast(lang==="da"?"Kunne ikke sende — prøv igen":"Couldn't send — try again");input.disabled=false;input.focus();return;}
      renderComments($("#commentList"),d.comments||[]);
      input.value="";
      // update comment count in feed
      const countEl=document.querySelector('[data-comments="'+activeCommentEntry+'"] .comment-count');
      if(countEl)countEl.textContent=(d.comments||[]).length;
    }catch(e){
      showToast(lang==="da"?"Ingen forbindelse — prøv igen":"No connection — try again");
    }
    input.disabled=false;input.focus();
  }

  async function searchUsers(q){
    const el=$("#feedSearchResults");if(!el)return;
    if(!q||q.length<2){el.style.display="none";return;}
    el.style.display="block";el.innerHTML=skeletonRows(2);
    const base=apiBase();const token=await getToken();if(!base||!token){el.innerHTML="";return;}
    try{
      const res=await fetch(base+"/api/users/search?q="+encodeURIComponent(q),{headers:{"Authorization":"Bearer "+token}});
      const d=await res.json();
      const users=d.users||[];
      if(!users.length){el.innerHTML='<div class="feed-empty-msg" style="padding:12px">'+esc(t("feed_no_results"))+'</div>';return;}
      el.innerHTML='<div class="feed-results">'+users.map(u=>{
        const fs=_followingCache[u.id]||u.followStatus||"none";
        const name=u.nickname||(u.username?"@"+u.username:t("lb_anon"));
        const handle=u.username?"@"+u.username:"";
        return '<div class="feed-user-row">'
          +'<div class="feed-user-info"><div class="feed-user-nick">'+esc(name)+'</div>'+(handle&&handle!==name?'<div class="feed-user-prof">'+esc(handle)+'</div>':u.profession?'<div class="feed-user-prof">'+esc(u.profession)+'</div>':'')+'</div>'
          +'<button class="'+followBtnClass(fs)+'" data-follow="'+esc(u.id)+'" data-follow-status="'+esc(fs)+'">'+esc(followBtnLabel(fs))+'</button>'
          +'</div>';
      }).join("")+'</div>';
    }catch(e){el.innerHTML="";}
  }

  function updateFollowBtn(btn,newStatus){
    btn.className=followBtnClass(newStatus);
    btn.textContent=followBtnLabel(newStatus);
    btn.dataset.followStatus=newStatus;
  }

  // ══════════ CV / Resume ══════════
  function getResume(){ if(!state.resume)state.resume=_normResume(null); return state.resume; }
  function _resumeInitial(){ return (getResume().name||"?").trim().charAt(0).toUpperCase()||"?"; }
  function _resumeStats(){
    const stats=[];
    state.counters.map(c=>({n:counterTotal(c),l:tLabel(c.label)})).filter(x=>x.n>0).sort((a,b)=>b.n-a.n).slice(0,3).forEach(x=>stats.push(x));
    const wines=(state.wines||[]).length;
    if(wines>0)stats.push({n:wines,l:lang==="da"?"Vine i kælderen":"Wines"});
    const badges=getBadgesEarned().length;
    if(badges>0&&stats.length<4)stats.push({n:badges,l:lang==="da"?"Anerkendelser":"Awards"});
    if(!stats.length)stats.push({n:career(),l:lang==="da"?"Håndværk i alt":"Craft total"});
    return stats.slice(0,4);
  }
  function _resumeYears(){
    const years=getResume().work.map(w=>parseInt(w.start,10)).filter(y=>y>1950&&y<2100);
    return years.length?(new Date().getFullYear())-Math.min(...years):null;
  }
  function renderResumePreview(){
    const el=$("#resumeCard");if(!el)return;
    const r=getResume();
    const name=r.name||(lang==="da"?"Dit navn":"Your name");
    const stats=_resumeStats(),yrs=_resumeYears(),meta=[];
    if(r.location)meta.push('📍 '+esc(r.location));
    if(yrs!=null)meta.push('🔪 '+yrs+(lang==="da"?" år i faget":" yrs in the trade"));
    const avInner=r.photo?'<img src="'+esc(r.photo)+'" alt="">':esc(_resumeInitial());
    let html='<div class="rc-head"><div class="rc-avatar'+(r.photo?' has-photo':'')+'">'+avInner+'</div>'
      +'<div class="rc-who"><div class="rc-name">'+esc(name)+'</div>'
      +(r.title?'<div class="rc-role">'+esc(r.title)+'</div>':'')
      +(meta.length?'<div class="rc-meta">'+meta.map(m=>'<span>'+m+'</span>').join('')+'</div>':'')
      +'</div></div>';
    if(stats.length)html+='<div class="rc-stats" style="grid-template-columns:repeat('+stats.length+',1fr)">'+stats.map(s=>'<div class="rc-stat"><div class="n">'+esc(fmtNum(s.n))+'</div><div class="l">'+esc(s.l)+'</div></div>').join('')+'</div>';
    html+='<div class="rc-body">';
    if(r.bio)html+='<div class="rc-bio">'+esc(r.bio)+'</div>';
    if(r.specialties.length)html+='<section><p class="rc-sec-lbl">'+(lang==="da"?"Speciale":"Specialties")+'</p><div class="rc-chips">'+r.specialties.map(s=>'<span class="rc-chip">'+esc(s)+'</span>').join('')+'</div></section>';
    if(r.work.length)html+='<section><p class="rc-sec-lbl">'+(lang==="da"?"Erfaring":"Experience")+'</p>'+r.work.map(w=>{
      const when=[w.start,w.end].filter(x=>x).join(' – ');
      return '<div class="rc-exp-row"><span class="rc-exp-dot"></span><div class="rc-exp-main"><div class="rc-exp-place">'+esc(w.place||'—')+'</div>'+(w.role?'<div class="rc-exp-role">'+esc(w.role)+'</div>':'')+'</div>'+(when?'<div class="rc-exp-when">'+esc(when)+'</div>':'')+'</div>';
    }).join('')+'</section>';
    if(!r.bio&&!r.specialties.length&&!r.work.length)html+='<p class="rc-empty">'+(lang==="da"?"Udfyld felterne nedenfor, så tager dit CV form.":"Fill in the fields below and your CV takes shape.")+'</p>';
    html+='</div>';
    const contact=[r.email,r.phone].filter(x=>x).join('   ·   ');
    if(contact)html+='<div class="rc-foot">'+esc(contact)+'</div>';
    el.innerHTML=html;
  }
  function _reField(key,label,val,type,ph){
    return '<div class="re-field"><label>'+esc(label)+'</label><input class="input" type="'+type+'" data-rf="'+key+'" value="'+esc(val||"")+'"'+(ph?' placeholder="'+esc(ph)+'"':'')+'></div>';
  }
  function _reJob(w,i){
    const L=(da,en)=>lang==="da"?da:en;
    return '<div class="re-job"><button class="re-job-del" data-rj-del="'+i+'" aria-label="Slet">×</button>'
      +'<div class="re-field"><label>'+L("Sted","Place")+'</label><input class="input" data-rj="place" data-rj-idx="'+i+'" value="'+esc(w.place)+'"></div>'
      +'<div class="re-field"><label>'+L("Rolle","Role")+'</label><input class="input" data-rj="role" data-rj-idx="'+i+'" value="'+esc(w.role)+'"></div>'
      +'<div class="re-row2"><div class="re-field"><label>'+L("Fra (år)","From (yr)")+'</label><input class="input" data-rj="start" data-rj-idx="'+i+'" value="'+esc(w.start)+'" placeholder="2021"></div>'
      +'<div class="re-field"><label>'+L("Til","To")+'</label><input class="input" data-rj="end" data-rj-idx="'+i+'" value="'+esc(w.end)+'" placeholder="'+L("nu","now")+'"></div></div></div>';
  }
  function renderResumeEditor(){
    const el=$("#resumeEditor");if(!el)return;
    const r=getResume();const L=(da,en)=>lang==="da"?da:en;
    el.innerHTML=
      '<div class="re-group"><h3>'+L("Om dig","About you")+'</h3>'
      +'<div class="re-photo"><div class="re-photo-av'+(r.photo?' has':'')+'">'+(r.photo?'<img src="'+esc(r.photo)+'" alt="">':esc(_resumeInitial()))+'</div>'
      +'<div class="re-photo-btns"><button type="button" class="re-photo-btn" id="rewPhotoPick">'+(r.photo?L("Skift foto","Change photo"):L("Upload foto","Upload photo"))+'</button>'
      +(r.photo?'<button type="button" class="re-photo-rm" id="rewPhotoRm">'+L("Fjern","Remove")+'</button>':'')+'</div></div>'
      +_reField("name",L("Fulde navn","Full name"),r.name,"text")
      +_reField("title",L("Titel / rolle","Title / role"),r.title,"text",L("fx Kok · Chef de partie","e.g. Chef de partie"))
      +'<div class="re-row2">'+_reField("location",L("By","City"),r.location,"text")+_reField("phone",L("Telefon","Phone"),r.phone,"tel")+'</div>'
      +_reField("email",L("Email","Email"),r.email,"email")
      +'<div class="re-field"><label>'+L("Kort om dig","Short bio")+'</label><textarea class="input" data-rf="bio" placeholder="'+L("1-2 linjer om hvad du er god til…","1-2 lines about your craft…")+'">'+esc(r.bio||"")+'</textarea></div>'
      +'</div>'
      +'<div class="re-group"><h3>'+L("Speciale","Specialties")+'</h3>'
      +_reField("specialties",L("Kommasepareret","Comma separated"),r.specialties.join(", "),"text",L("fx Skaldyr, Saucier, Naturvin","e.g. Seafood, Saucier"))
      +'</div>'
      +'<div class="re-group"><h3>'+L("Erfaring","Experience")+'</h3>'
      +r.work.map((w,i)=>_reJob(w,i)).join("")
      +'<button class="re-add" id="reAddJob">+ '+L("Tilføj job","Add job")+'</button></div>';
    el.querySelectorAll("[data-rf]").forEach(inp=>inp.addEventListener("input",()=>_resumeSetField(inp.dataset.rf,inp.value)));
    el.querySelectorAll("[data-rj]").forEach(inp=>inp.addEventListener("input",()=>{
      const i=parseInt(inp.dataset.rjIdx,10),f=inp.dataset.rj,r2=getResume();
      if(r2.work[i]){r2.work[i][f]=inp.value;save();renderResumePreview();}
    }));
    el.querySelectorAll("[data-rj-del]").forEach(b=>b.addEventListener("click",()=>{
      getResume().work.splice(parseInt(b.dataset.rjDel,10),1);save();renderResumePreview();renderResumeEditor();
    }));
    const add=$("#reAddJob");if(add)add.addEventListener("click",()=>{getResume().work.push({id:id(),place:"",role:"",start:"",end:""});save();renderResumePreview();renderResumeEditor();});
    const pick=$("#rewPhotoPick");if(pick)pick.addEventListener("click",()=>{const pi=$("#resumePhotoInput");if(pi)pi.click();});
    const rm=$("#rewPhotoRm");if(rm)rm.addEventListener("click",()=>{getResume().photo="";save();renderResumePreview();renderResumeEditor();});
  }
  function _resumeSetField(key,val){
    const r=getResume();
    if(key==="specialties")r.specialties=val.split(",").map(s=>s.trim()).filter(s=>s);
    else r[key]=val;
    save();renderResumePreview();
  }
  function openResume(){ track("resume_open");renderResumePreview();renderResumeEditor();const ov=$("#resumeOverlay");if(ov)ov.classList.add("open"); }
  function closeResume(){ const ov=$("#resumeOverlay");if(ov)ov.classList.remove("open"); }
  function _loadImg(src){return new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=rej;im.src=src;});}
  function _wrapText(ctx,text,x,y,maxW,lh){
    const words=String(text).split(/\s+/);let line="";
    words.forEach(w=>{const test=line?line+" "+w:w;if(ctx.measureText(test).width>maxW&&line){ctx.fillText(line,x,y);line=w;y+=lh;}else line=test;});
    if(line)ctx.fillText(line,x,y);
    return y;
  }
  let _resumeBlob=null;
  // "Del" i headeren → render billedet og vis det i en preview FØR deling.
  async function openResumeShare(){
    const r=getResume();
    if(!r.name&&!r.work.length){showToast(lang==="da"?"Udfyld dit CV først":"Fill in your CV first");return;}
    track("resume_preview");haptic(20);
    const btn=$("#resumeExport");if(btn)btn.style.opacity=".5";
    const out=await _buildResumeBlob();
    if(btn)btn.style.opacity="";
    if(!out){showToast(lang==="da"?"Kunne ikke lave billedet — prøv igen":"Couldn't render — try again");return;}
    _resumeBlob=out;
    const img=$("#resumeShareImg");if(img)img.src=URL.createObjectURL(out.blob);
    const s=$("#resumeShareScrim");if(s)s.classList.add("open");
  }
  async function shareResumeBlob(){
    if(!_resumeBlob)return;
    track("resume_share");
    const file=new File([_resumeBlob.blob],_resumeBlob.fname,{type:"image/png"});
    if(navigator.canShare&&navigator.canShare({files:[file]})){
      try{await navigator.share({files:[file]});return;}catch(e){if(e&&e.name==="AbortError")return;}
    }
    const a=document.createElement("a");a.href=URL.createObjectURL(_resumeBlob.blob);a.download=_resumeBlob.fname;a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),5000);
  }
  async function _buildResumeBlob(){
    const r=getResume();
    try{await document.fonts.load('600 76px Fraunces');await document.fonts.load('600 56px Fraunces');await document.fonts.load('600 34px Inter');}catch(e){}
    const W=1080,H=1527,P=90;
    const cv=document.createElement("canvas");cv.width=W;cv.height=H;
    const ctx=cv.getContext("2d");
    const paper="#FBFAF8",ink="#1C1517",accent="#8A2E3F",accentH="#6B1E2E",dim="#8C8085",line="#E7E1DD";
    ctx.fillStyle=paper;ctx.fillRect(0,0,W,H);
    function rr(x,y,w,h,rad){ctx.beginPath();ctx.moveTo(x+rad,y);ctx.arcTo(x+w,y,x+w,y+h,rad);ctx.arcTo(x+w,y+h,x,y+h,rad);ctx.arcTo(x,y+h,x,y,rad);ctx.arcTo(x,y,x+w,y,rad);ctx.closePath();}
    const av=132;
    let photoImg=null;
    if(r.photo){try{photoImg=await _loadImg(r.photo);}catch(e){}}
    if(photoImg){
      ctx.save();rr(P,P,av,av,26);ctx.clip();
      const s=Math.max(av/photoImg.width,av/photoImg.height),dw=photoImg.width*s,dh=photoImg.height*s;
      ctx.drawImage(photoImg,P+(av-dw)/2,P+(av-dh)/2,dw,dh);
      ctx.restore();
    }else{
      const grd=ctx.createLinearGradient(P,P,P+av,P+av);grd.addColorStop(0,accent);grd.addColorStop(1,accentH);
      ctx.fillStyle=grd;rr(P,P,av,av,26);ctx.fill();
      ctx.fillStyle="#F9EEF0";ctx.font="600 76px Fraunces, serif";ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.fillText(_resumeInitial(),P+av/2,P+av/2+4);
      ctx.textBaseline="alphabetic";ctx.textAlign="left";
    }
    const tx=P+av+34;
    ctx.fillStyle=ink;ctx.font="600 60px Fraunces, serif";ctx.fillText((r.name||"Dit navn").slice(0,24),tx,P+52);
    let hy=P+52;
    if(r.title){ctx.fillStyle=accent;ctx.font="600 34px Inter, sans-serif";hy+=46;ctx.fillText(r.title.slice(0,38),tx,hy);}
    const yrs=_resumeYears(),mp=[];if(r.location)mp.push(r.location);if(yrs!=null)mp.push(yrs+(lang==="da"?" år i faget":" yrs"));
    if(mp.length){ctx.fillStyle=dim;ctx.font="400 30px Inter, sans-serif";hy+=44;ctx.fillText(mp.join("   ·   "),tx,hy);}
    let y=Math.max(P+av,hy)+70;
    ctx.strokeStyle=line;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(P,y);ctx.lineTo(W-P,y);ctx.stroke();y+=66;
    const stats=_resumeStats();
    if(stats.length){
      const cw=(W-2*P)/stats.length;
      stats.forEach((s,i)=>{const cx=P+cw*i+cw/2;ctx.textAlign="center";
        ctx.fillStyle=ink;ctx.font="600 54px Fraunces, serif";ctx.fillText(fmtNum(s.n),cx,y);
        ctx.fillStyle=dim;ctx.font="600 21px Inter, sans-serif";ctx.fillText(s.l.toUpperCase().slice(0,16),cx,y+38);});
      ctx.textAlign="left";y+=94;
      ctx.strokeStyle=line;ctx.beginPath();ctx.moveTo(P,y);ctx.lineTo(W-P,y);ctx.stroke();y+=58;
    }
    function seclbl(txt){ctx.fillStyle=accent;ctx.font="700 24px Inter, sans-serif";ctx.fillText(txt.toUpperCase(),P,y);y+=46;}
    if(r.bio){ctx.fillStyle=ink;ctx.font="400 32px Inter, sans-serif";y=_wrapText(ctx,r.bio,P,y,W-2*P,46)+40;}
    if(r.specialties.length){
      seclbl(lang==="da"?"Speciale":"Specialties");
      let cx=P;ctx.font="500 28px Inter, sans-serif";
      r.specialties.forEach(sp=>{const w=ctx.measureText(sp).width+44;if(cx+w>W-P){cx=P;y+=64;}
        ctx.strokeStyle=line;ctx.lineWidth=2;rr(cx,y-40,w,52,26);ctx.stroke();
        ctx.fillStyle=ink;ctx.fillText(sp,cx+22,y-4);cx+=w+14;});
      y+=74;
    }
    if(r.work.length){
      seclbl(lang==="da"?"Erfaring":"Experience");
      r.work.slice(0,6).forEach(w=>{
        ctx.fillStyle=accent;ctx.beginPath();ctx.arc(P+7,y-11,7,0,7);ctx.fill();
        ctx.fillStyle=ink;ctx.font="600 34px Inter, sans-serif";ctx.fillText((w.place||"—").slice(0,32),P+34,y);
        const when=[w.start,w.end].filter(x=>x).join(" – ");
        if(when){ctx.fillStyle=dim;ctx.font="400 28px Inter, sans-serif";ctx.textAlign="right";ctx.fillText(when,W-P,y);ctx.textAlign="left";}
        if(w.role){y+=40;ctx.fillStyle=dim;ctx.font="400 28px Inter, sans-serif";ctx.fillText(w.role.slice(0,42),P+34,y);}
        y+=64;
      });
    }
    const contact=[r.email,r.phone].filter(x=>x).join("    ·    ");
    if(contact){ctx.strokeStyle=line;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(P,H-140);ctx.lineTo(W-P,H-140);ctx.stroke();
      ctx.fillStyle=dim;ctx.font="500 28px Inter, sans-serif";ctx.fillText(contact,P,H-86);}
    const blob=await new Promise(res=>cv.toBlob(res,"image/png"));
    if(!blob)return null;
    const fname=((r.name||"cv").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"cv")+".png";
    return {blob,fname};
  }

  function setupFeed(){
    const feedEl=$("#feedContent");
    feedEl.addEventListener("click",async e=>{
      // follow/unfollow
      const followBtn=e.target.closest("[data-follow]");
      if(followBtn){
        const uid=followBtn.dataset.follow;
        const curStatus=followBtn.dataset.followStatus||"none";
        const newStatus=(curStatus==="none")?"pending":"none";
        updateFollowBtn(followBtn,newStatus);
        const prevCache=_followingCache[uid];
        _followingCache[uid]=newStatus==="none"?undefined:newStatus;
        const ok=await toggleFollow(uid,curStatus);
        if(!ok){
          updateFollowBtn(followBtn,curStatus);
          _followingCache[uid]=prevCache;
          showToast(lang==="da"?"Kunne ikke opdatere — prøv igen":"Couldn't update — try again");
        }
        return;
      }
      // like
      const likeBtn=e.target.closest("[data-like]");
      if(likeBtn){await toggleLike(likeBtn.dataset.like,likeBtn);return;}
      // comments
      const commentBtn=e.target.closest("[data-comments]");
      if(commentBtn){await openComments(commentBtn.dataset.comments);return;}
      // load more
      if(e.target.id==="feedLoadMore"){loadFeed(true);}
    });

    // search results follow buttons
    const searchRes=$("#feedSearchResults");
    if(searchRes){
      searchRes.addEventListener("click",async e=>{
        const followBtn=e.target.closest("[data-follow]");
        if(!followBtn)return;
        const uid=followBtn.dataset.follow;
        const curStatus=followBtn.dataset.followStatus||"none";
        const newStatus=(curStatus==="none")?"pending":"none";
        updateFollowBtn(followBtn,newStatus);
        const prevCache=_followingCache[uid];
        _followingCache[uid]=newStatus==="none"?undefined:newStatus;
        const ok=await toggleFollow(uid,curStatus);
        if(!ok){
          updateFollowBtn(followBtn,curStatus);
          _followingCache[uid]=prevCache;
          showToast(lang==="da"?"Kunne ikke opdatere — prøv igen":"Couldn't update — try again");
        }
      });
    }

    // search input
    let searchTimer=null;
    const searchInput=$("#feedSearch");
    if(searchInput){
      searchInput.addEventListener("input",e=>{
        clearTimeout(searchTimer);
        const q=e.target.value.trim();
        if(!q){const r=$("#feedSearchResults");if(r)r.style.display="none";return;}
        searchTimer=setTimeout(()=>searchUsers(q),350);
      });
      searchInput.addEventListener("blur",()=>setTimeout(()=>{const r=$("#feedSearchResults");if(r)r.style.display="none";},200));
    }
    const feedSearchBtn=$("#feedSearchBtn");
    if(feedSearchBtn)feedSearchBtn.addEventListener("click",()=>{const q=($("#feedSearch").value||"").trim();if(q)searchUsers(q);});

    // Ét samlet feed (dine egne + dem du følger) — ingen faner.
    window._reloadFeed=()=>loadFeed(false);

    // ── Foto-opslag composer ("Del et foto") ──
    let _feedPostPhoto=null;
    function _feedPostReflect(){
      const wrap=$("#feedPostPhotoWrap"),thumb=$("#feedPostThumb");
      if(thumb)thumb.src=_feedPostPhoto||"";
      if(wrap)wrap.classList.toggle("has",!!_feedPostPhoto);
    }
    function openFeedPost(){
      _feedPostPhoto=null;_feedPostReflect();
      const cap=$("#feedPostCaption");if(cap)cap.value="";
      const s=$("#feedPostScrim");if(s)s.classList.add("open");
    }
    function closeFeedPost(){const s=$("#feedPostScrim");if(s)s.classList.remove("open");}
    const composeBtn=$("#feedComposeBtn");if(composeBtn)composeBtn.addEventListener("click",openFeedPost);
    const fpWrap=$("#feedPostPhotoWrap");if(fpWrap)fpWrap.addEventListener("click",()=>{const pi=$("#feedPostPhotoInput");if(pi)pi.click();});
    const fpInput=$("#feedPostPhotoInput");
    if(fpInput)fpInput.addEventListener("change",async()=>{
      const file=fpInput.files&&fpInput.files[0];if(!file)return;
      if(!file.type.startsWith("image/")){showToast(t("img_only"));fpInput.value="";return;}
      if(file.size>20*1024*1024){showToast(lang==="da"?"Billedet er for stort (maks 20 MB)":"Image too large (max 20 MB)");fpInput.value="";return;}
      const url=await resizeImage(file,1200);fpInput.value="";
      if(url){_feedPostPhoto=url;_feedPostReflect();}
    });
    const fpDo=$("#feedPostDo");
    if(fpDo)fpDo.addEventListener("click",async()=>{
      const caption=($("#feedPostCaption").value||"").trim();
      if(!_feedPostPhoto&&!caption){showToast(lang==="da"?"Vælg et foto først":"Pick a photo first");return;}
      const base=apiBase();const token=await getToken();
      if(!base||!token){showToast(lang==="da"?"Ingen forbindelse — prøv igen":"No connection — try again");return;}
      fpDo.disabled=true;fpDo.textContent="…";
      let imageUrl=null;
      try{
        if(_feedPostPhoto){
          const ur=await fetch(base+"/api/upload-photo",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({dataUrl:_feedPostPhoto})});
          const ud=await ur.json();imageUrl=ud.url||null;
        }
        const r=await fetch(base+"/api/feed-post",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({imageUrl,caption})});
        if(!r.ok)throw new Error("post");
        track("feed_post");haptic(40);closeFeedPost();
        showToast(lang==="da"?"Delt til feed 📷":"Shared to feed 📷");
        feedCursor=null;loadFeed(false);
      }catch(e){showToast(lang==="da"?"Noget gik galt — prøv igen":"Something went wrong, try again");}
      fpDo.disabled=false;fpDo.textContent=lang==="da"?"Del":"Share";
    });

    // comment send
    const sendBtn=$("#commentSend");if(sendBtn)sendBtn.addEventListener("click",sendComment);
    const cInput=$("#commentInput");
    if(cInput){
      cInput.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendComment();}});
      // Tastatur-animation tager ~300ms på iOS — løft arket ad flere omgange
      cInput.addEventListener("focus",()=>{[100,300,500].forEach(ms=>setTimeout(syncCommentToViewport,ms));});
      cInput.addEventListener("blur",()=>setTimeout(syncCommentToViewport,100));
    }
    if(window.visualViewport)window.visualViewport.addEventListener("resize",syncCommentToViewport);
  }

  // ---- The Lab ----
  var _labDishes=[];var _labFilter="all";var _currentDish=null;var _dishDirty=false;var _saveTimer=null;
  var _labSeg="mine";var _myLabTeams=null;var _sharedDish=null;var _viewMode="shared";
  var FREE_TEAM_SHARES=3,FREE_PUBLIC=2;
  function _dishStatusLabels(){return {idea:lang==="da"?"Idé":"Idea",testing:"Test",ready:lang==="da"?"Klar":"Ready",menu:lang==="da"?"På menu":"On menu"};}
  async function _labTeams(){
    if(_myLabTeams!==null)return _myLabTeams;
    const base=apiBase();const token=await getToken();if(!base||!token)return (_myLabTeams=[]);
    try{const r=await fetch(base+"/api/teams/list",{headers:{"Authorization":"Bearer "+token}});const d=await r.json();_myLabTeams=d.teams||[];}catch(e){_myLabTeams=[];}
    return _myLabTeams;
  }
  function invalidateLabTeams(){_myLabTeams=null;}

  function setupLab(){
    const sub=$("#labSub");if(sub)sub.textContent=lang==="da"?"Opskrifter i udvikling":"Recipes in development";
    const segMine=$("#labSegMine");if(segMine)segMine.textContent=lang==="da"?"Mine retter":"My dishes";
    const segKit=$("#labSegKitchen");if(segKit)segKit.textContent=lang==="da"?"Køkkenet":"The Kitchen";
    const segBooks=$("#labSegBooks");if(segBooks)segBooks.textContent=lang==="da"?"Kogebøger":"Cookbooks";
    const seg=$("#labSeg");
    if(seg)seg.addEventListener("click",e=>{
      const btn=e.target.closest(".lab-seg-btn");if(!btn)return;
      _labSeg=btn.dataset.seg;
      seg.querySelectorAll(".lab-seg-btn").forEach(b=>b.classList.toggle("active",b===btn));
      renderLabSeg();
    });
    // Filter chips
    const filterRow=$("#labFilterRow");
    if(filterRow)filterRow.addEventListener("click",e=>{
      const chip=e.target.closest(".lab-filter-chip");if(!chip)return;
      _labFilter=chip.dataset.filter||"all";
      filterRow.querySelectorAll(".lab-filter-chip").forEach(c=>c.classList.toggle("active",c===chip));
      renderLabList();
    });
    // New dish
    var newBtn=$("#labNewBtn");
    if(newBtn)newBtn.addEventListener("click",createAndOpenDish);
    // Dish list clicks
    var labList=$("#labList");
    if(labList)labList.addEventListener("click",e=>{
      var card=e.target.closest(".dish-card[data-dish-id]");if(!card)return;
      var dish=_labDishes.find(function(d){return d.id===card.dataset.dishId;});
      if(dish)openDishEditor(dish);
    });
    // Delte retter
    if(labList)labList.addEventListener("click",e=>{
      var sc=e.target.closest(".dish-card[data-shared-id]");if(!sc)return;
      var sd=(_sharedCache||[]).find(function(d){return d.id===sc.dataset.sharedId;});
      if(sd)openSharedDish(sd);
    });
    var sdClose=$("#sdClose");if(sdClose)sdClose.addEventListener("click",function(){$("#sharedDishScrim").classList.remove("open");});
    var sdFork=$("#sdFork");if(sdFork)sdFork.addEventListener("click",forkSharedDish);
    var labProOk=$("#labProOk");
    if(labProOk)labProOk.addEventListener("click",async function(){
      if(_proWaitJoined){$("#labProScrim").classList.remove("open");return;}
      var base=apiBase();var token=await getToken();
      if(base&&token){
        try{await fetch(base+"/api/pro/waitlist",{method:"POST",headers:{"Authorization":"Bearer "+token}});}catch(e){}
      }
      _proWaitJoined=true;localStorage.setItem("mise_pro_waitlist","1");
      track("pro_waitlist");haptic(40);
      labProOk.textContent=lang==="da"?"Du er på listen ✓ — vi giver besked":"You\u2019re on the list ✓";
      setTimeout(function(){$("#labProScrim").classList.remove("open");},1100);
    });
    // Delings-chips
    var visBar=$("#deVisBar");
    if(visBar)visBar.addEventListener("click",function(e){
      var chip=e.target.closest(".de-vis-chip");if(!chip||!_currentDish)return;
      setDishVisibility(chip.dataset.vis);
    });
    // Service-noter AI
    var notesAiBtn=$("#notesAiBtn");if(notesAiBtn)notesAiBtn.addEventListener("click",summarizeServiceNotes);
    // Editor back
    var deBack=$("#deBack");if(deBack)deBack.addEventListener("click",closeDishEditor);
    // Se opskrift (ren læse-visning af den nuværende ret)
    var deViewBtn=$("#deViewBtn");if(deViewBtn)deViewBtn.addEventListener("click",function(){if(!_currentDish)return;_syncDishFields();openDishView(_currentDish);if(_dishDirty)saveDish(false);});
    // Editor save
    var deSaveBtn=$("#deSaveBtn");if(deSaveBtn)deSaveBtn.addEventListener("click",function(){saveDish(true);});
    // Status chips
    var statusBar=$("#deStatusBar");
    if(statusBar)statusBar.addEventListener("click",function(e){
      var chip=e.target.closest(".de-status-chip");if(!chip||!_currentDish)return;
      _currentDish.status=chip.dataset.status;updateStatusChips(_currentDish.status);markDirty();
    });
    // Section accordions
    document.querySelectorAll(".ds .ds-hd").forEach(function(hd){
      hd.addEventListener("click",function(){
        const sec=hd.closest(".ds");const bd=sec.querySelector(".ds-bd");
        const opening=!sec.classList.contains("open");
        if(opening){sec.classList.add("open");if(bd)_animOpen(bd);}
        else if(bd)_animClose(bd,()=>sec.classList.remove("open"));
        else sec.classList.remove("open");
        haptic(10);
      });
    });
    // Ingredient add
    var ingAddBtn=$("#ingAddBtn");
    if(ingAddBtn)ingAddBtn.addEventListener("click",function(){
      if(!_currentDish)return;
      var id="i"+Date.now();
      (_currentDish.data.ingredients=_currentDish.data.ingredients||[]).push({id:id,name:"",amount:"",unit:"g",prep:""});
      renderIngredients();markDirty();
      setTimeout(function(){var last=document.querySelector("#ingList .ing-row:last-of-type");var f=last&&last.querySelector(".ing-name-field");if(f)f.focus();},50);
    });
    // Ingredient AI
    var ingAiBtn=$("#ingAiBtn");
    if(ingAiBtn)ingAiBtn.addEventListener("click",function(){openAiSheet(lang==="da"?"Analyser mine ingredienser og foreslå hvad der mangler, hvilke smagskomponenter der supplerer godt, og én nøgleingrediensændring der løfter retten":"Analyze my ingredients and suggest what's missing, which flavor components complement well, and one key change to elevate the dish");});
    // Wine AI
    var wineAiBtn=$("#wineAiBtn");
    if(wineAiBtn)wineAiBtn.addEventListener("click",function(){openAiSheet(lang==="da"?"Foreslå 2-3 specifikke vine (region, drue, stil) der passer perfekt til denne ret, og forklar kort hvorfor":"Suggest 2-3 specific wines (region, grape, style) that pair perfectly with this dish and briefly explain why");});
    // Dish description AI
    var dishDescAiBtn=$("#dishDescAiBtn");
    if(dishDescAiBtn)dishDescAiBtn.addEventListener("click",generateDishDescription);
    // Steps add
    var stepAddBtn=$("#stepAddBtn");
    if(stepAddBtn)stepAddBtn.addEventListener("click",function(){
      if(!_currentDish)return;
      var id="s"+Date.now();
      (_currentDish.data.steps=_currentDish.data.steps||[]).push({id:id,text:"",time:"",temp:""});
      renderSteps();markDirty();
      setTimeout(function(){var last=document.querySelector("#stepList .step-row:last-of-type");var f=last&&last.querySelector(".step-txt");if(f)f.focus();},50);
    });
    // Test round add
    var testAddBtn=$("#testAddBtn");
    if(testAddBtn)testAddBtn.addEventListener("click",function(){
      if(!_currentDish)return;
      var id="t"+Date.now();
      var today=new Date().toISOString().slice(0,10);
      (_currentDish.data.testRounds=_currentDish.data.testRounds||[]).push({id:id,date:today,rating:0,notes:""});
      renderTestRounds();markDirty();
    });
    // Delete dish
    var deDeleteBtn=$("#deDeleteBtn");
    if(deDeleteBtn){
      deDeleteBtn.textContent=t("lab_delete_dish");
      deDeleteBtn.addEventListener("click",async function(){
        if(!_currentDish)return;
        if(!confirm(lang==="da"?"Slet denne ret permanent?":"Delete this dish permanently?"))return;
        var base=apiBase();var token=await getToken();
        try{await fetch(base+"/api/lab/dishes/"+_currentDish.id,{method:"DELETE",headers:{"Authorization":"Bearer "+token}});closeDishEditor();_labDishes=_labDishes.filter(function(d){return d.id!==_currentDish.id;});renderLabList();showToast(lang==="da"?"Ret slettet":"Dish deleted");}
        catch(e){showToast(lang==="da"?"Noget gik galt":"Something went wrong");}
      });
    }
    // Hero photo
    var deHeroAdd=$("#deHeroAdd");var deHeroInput=$("#deHeroInput");var deHeroImg=$("#deHeroImg");
    if(deHeroAdd)deHeroAdd.addEventListener("click",function(){if(deHeroInput)deHeroInput.click();});
    if(deHeroImg)deHeroImg.addEventListener("click",function(){if(deHeroInput)deHeroInput.click();});
    if(deHeroInput)deHeroInput.addEventListener("change",async function(e){
      var f=e.target.files[0];if(!f||!_currentDish)return;deHeroInput.value="";
      var compressed=await compressPhoto(f);var url=await uploadDishPhoto(compressed);
      if(url){_currentDish.heroUrl=url;setHeroPhoto(url);markDirty();}
    });
    // Plating photo
    var dePlatingPhotoAdd=$("#dePlatingPhotoAdd");var dePlatingInput=$("#dePlatingInput");var dePlatingPhoto=$("#dePlatingPhoto");
    if(dePlatingPhotoAdd)dePlatingPhotoAdd.addEventListener("click",function(){if(dePlatingInput)dePlatingInput.click();});
    if(dePlatingPhoto)dePlatingPhoto.addEventListener("click",function(){if(dePlatingInput)dePlatingInput.click();});
    if(dePlatingInput)dePlatingInput.addEventListener("change",async function(e){
      var f=e.target.files[0];if(!f||!_currentDish)return;dePlatingInput.value="";
      var compressed=await compressPhoto(f);var url=await uploadDishPhoto(compressed);
      if(url){(_currentDish.data=_currentDish.data||{}).platingUrl=url;setPlatingPhoto(url);markDirty();}
    });
    // Gallery photo
    var dePhotoInput=$("#dePhotoInput");
    if(dePhotoInput)dePhotoInput.addEventListener("change",async function(e){
      var f=e.target.files[0];if(!f||!_currentDish)return;dePhotoInput.value="";
      var compressed=await compressPhoto(f);var url=await uploadDishPhoto(compressed);
      if(url){(_currentDish.data.photos=_currentDish.data.photos||[]).push({url:url,caption:""});renderPhotoGallery();markDirty();}
    });
    // AI fab + sheet
    var aiFab=$("#aiFab");if(aiFab)aiFab.addEventListener("click",function(){openAiSheet("");});
    var aiScrim=$("#aiScrim");if(aiScrim)aiScrim.addEventListener("click",function(e){if(e.target===aiScrim)closeAiSheet();});
    var aiSendBtn=$("#aiSendBtn");if(aiSendBtn)aiSendBtn.addEventListener("click",sendAiMessage);
    var aiInput=$("#aiInput");if(aiInput)aiInput.addEventListener("keydown",function(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendAiMessage();}});
    // Name live save
    var deName=$("#deName");if(deName)deName.addEventListener("input",function(){if(!_currentDish)return;_currentDish.name=deName.value||"Ny ret";markDirty();});
  }

  function markDirty(){
    _dishDirty=true;
    var saveLbl=$("#deSaveLbl");var saveBtn=$("#deSaveBtn");
    if(saveBtn)saveBtn.classList.remove("saved");
    if(saveLbl)saveLbl.textContent=lang==="da"?"Gem":"Save";
    clearTimeout(_saveTimer);_saveTimer=setTimeout(function(){saveDish(false);},900);
  }

  function updateStatusChips(status){
    document.querySelectorAll(".de-status-chip").forEach(function(c){
      c.className="de-status-chip";if(c.dataset.status===status)c.classList.add("active-"+status);
    });
  }

  function setHeroPhoto(url){
    var img=$("#deHeroImg");var add=$("#deHeroAdd");
    if(img){img.src=url||"";img.style.display=url?"block":"none";}
    if(add)add.style.display=url?"none":"flex";
  }

  function setPlatingPhoto(url){
    var img=$("#dePlatingPhoto");var add=$("#dePlatingPhotoAdd");
    if(img){img.src=url||"";img.style.display=url?"block":"none";}
    if(add)add.style.display=url?"none":"flex";
  }

  async function uploadDishPhoto(dataUrl){
    var base=apiBase();var token=await getToken();if(!base||!token)return null;
    try{var r=await fetch(base+"/api/upload-photo",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({dataUrl:dataUrl})});var d=await r.json();return d.url||null;}
    catch(e){return null;}
  }

  async function createAndOpenDish(){
    var base=apiBase();var token=await getToken();
    if(!base||!token){showToast(lang==="da"?"Ikke logget ind":"Not logged in");return;}
    try{
      var r=await fetch(base+"/api/lab/dishes",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({name:lang==="da"?"Ny ret":"New dish",status:"idea",data:{}})});
      var dish=await r.json();
      if(!r.ok)throw new Error(dish.error||("HTTP "+r.status));
      if(dish.id){_labDishes.unshift(dish);openDishEditor(dish,true);}
      else throw new Error("Intet id retur");
    }catch(e){
      showToast(lang==="da"?"Kunne ikke oprette ret — er lab_dishes tabellen oprettet i Supabase?":"Failed — is the lab_dishes table created in Supabase?");
      console.error("createAndOpenDish:",e);
    }
  }

  function openDishEditor(dish,isNew){
    _currentDish=JSON.parse(JSON.stringify(dish));
    _currentDish.data=_currentDish.data||{};
    _dishDirty=false;
    var editor=$("#dishEditor");if(!editor)return;
    var deName=$("#deName");if(deName)deName.value=_currentDish.name||"";
    var deSaveLbl=$("#deSaveLbl");if(deSaveLbl)deSaveLbl.textContent=lang==="da"?"Gem":"Save";
    var saveBtn=$("#deSaveBtn");if(saveBtn)saveBtn.classList.remove("saved");
    updateStatusChips(_currentDish.status||"idea");
    setHeroPhoto(_currentDish.heroUrl||"");
    var d=_currentDish.data;
    var deSeason=$("#deSeason");if(deSeason)deSeason.value=d.season||"";
    var dePortions=$("#dePortions");if(dePortions)dePortions.value=d.portions||"";
    var dePortionUnit=$("#dePortionUnit");if(dePortionUnit)dePortionUnit.value=d.portionUnit||"prs";
    var deConcept=$("#deConcept");if(deConcept)deConcept.value=d.concept||"";
    var deCookTime=$("#deCookTime");if(deCookTime)deCookTime.value=d.cookTime||"";
    var deRestTime=$("#deRestTime");if(deRestTime)deRestTime.value=d.restTime||"";
    var deMainTemp=$("#deMainTemp");if(deMainTemp)deMainTemp.value=d.mainTemp||"";
    var dePlatingTime=$("#dePlatingTime");if(dePlatingTime)dePlatingTime.value=d.platingTime||"";
    var deTechnique=$("#deTechnique");if(deTechnique)deTechnique.value=d.technique||"";
    setPlatingPhoto(d.platingUrl||"");
    var dePlating=$("#dePlating");if(dePlating)dePlating.value=d.plating||"";
    var deWine=$("#deWine");if(deWine)deWine.value=d.winePairing||"";
    renderIngredients();renderSteps();renderTestRounds();renderPhotoGallery();
    updateVisChips(_currentDish.visibility||"private");renderServiceNotes();
    ["deSeason","dePortions","dePortionUnit","deConcept","deCookTime","deRestTime","deMainTemp","dePlatingTime","deTechnique","dePlating","deWine"].forEach(function(id){
      var el=document.getElementById(id);
      if(el&&!el._labWired){el._labWired=true;el.addEventListener("input",markDirty);}
    });
    editor.classList.add("open");editor.scrollTop=0;
    if(isNew){setTimeout(function(){var n=$("#deName");if(n){n.focus();n.select();}},350);}
  }

  function closeDishEditor(){
    clearTimeout(_saveTimer);if(_dishDirty)saveDish(false);
    var editor=$("#dishEditor");if(editor)editor.classList.remove("open");
    _currentDish=null;loadLabDishes();
  }

  function _syncDishFields(){
    if(!_currentDish)return;
    var d=_currentDish.data=_currentDish.data||{};
    var deName=$("#deName");if(deName)_currentDish.name=deName.value||"Ny ret";
    d.season=(document.getElementById("deSeason")||{}).value||"";
    d.portions=parseInt((document.getElementById("dePortions")||{}).value)||null;
    d.portionUnit=(document.getElementById("dePortionUnit")||{}).value||"prs";
    d.concept=(document.getElementById("deConcept")||{}).value||"";
    d.cookTime=(document.getElementById("deCookTime")||{}).value||"";
    d.restTime=(document.getElementById("deRestTime")||{}).value||"";
    d.mainTemp=(document.getElementById("deMainTemp")||{}).value||"";
    d.platingTime=(document.getElementById("dePlatingTime")||{}).value||"";
    d.technique=(document.getElementById("deTechnique")||{}).value||"";
    d.plating=(document.getElementById("dePlating")||{}).value||"";
    d.winePairing=(document.getElementById("deWine")||{}).value||"";
  }
  async function saveDish(showFeedback){
    if(!_currentDish)return;
    _syncDishFields();
    var d=_currentDish.data;
    var base=apiBase();var token=await getToken();if(!base||!token)return;
    try{
      var putRes=await fetch(base+"/api/lab/dishes/"+_currentDish.id,{method:"PUT",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({name:_currentDish.name,status:_currentDish.status,heroUrl:_currentDish.heroUrl||null,data:d,visibility:_currentDish.visibility||"private",teamId:_currentDish.teamId||null})});
      if(putRes.status===403){
        var errD=await putRes.json().catch(function(){return{};});
        _currentDish.visibility="private";_currentDish.teamId=null;updateVisChips("private");
        var localD=_labDishes.find(function(x){return x.id===_currentDish.id;});
        if(localD){localD.visibility="private";localD.teamId=null;}
        if(errD.error==="limit_team"||errD.error==="limit_public")openLabPro();
        else showToast(lang==="da"?"Kunne ikke dele — er du stadig på holdet?":"Couldn\u2019t share — are you still on the team?");
        saveDish(false);return;
      }
      _dishDirty=false;
      if(showFeedback){
        var saveBtn=$("#deSaveBtn");var saveLbl=$("#deSaveLbl");
        if(saveBtn)saveBtn.classList.add("saved");if(saveLbl)saveLbl.textContent=lang==="da"?"Gemt ✓":"Saved ✓";
        setTimeout(function(){if(saveBtn)saveBtn.classList.remove("saved");if(saveLbl)saveLbl.textContent=lang==="da"?"Gem":"Save";},2000);
      }
    }catch(e){if(showFeedback)showToast(lang==="da"?"Gemning fejlede":"Save failed");}
  }

  function renderIngredients(){
    var list=$("#ingList");if(!list||!_currentDish)return;
    var ings=_currentDish.data.ingredients||[];
    var dsCount=$("#dsIngCount");if(dsCount)dsCount.textContent=ings.length?ings.length+"":"";
    list.innerHTML=ings.map(function(ing){
      return '<div class="ing-row" data-ing-id="'+esc(ing.id)+'">'
        +'<input class="input ing-amt" value="'+esc(ing.amount||"")+'" placeholder="'+t("lab_ph_ing_amt")+'" data-field="amount" data-ing-id="'+esc(ing.id)+'">'
        +'<input class="input ing-unit" value="'+esc(ing.unit||"")+'" placeholder="'+t("lab_ph_ing_unit")+'" data-field="unit" data-ing-id="'+esc(ing.id)+'" list="deUnitsList">'
        +'<input class="input ing-name-field" value="'+esc(ing.name||"")+'" placeholder="'+t("lab_ph_ing_name")+'" data-field="name" data-ing-id="'+esc(ing.id)+'">'
        +'<button class="ing-rm" data-rm-ing="'+esc(ing.id)+'" title="'+t("del")+'">×</button>'
        +'</div>'
        +'<div class="ing-prep-row">'
        +'<input class="input" style="font-size:12px" value="'+esc(ing.prep||"")+'" placeholder="'+t("lab_ph_ing_prep")+'" data-field="prep" data-ing-id="'+esc(ing.id)+'">'
        +'<span></span>'
        +'</div>';
    }).join("")+'<datalist id="deUnitsList"><option value="g"><option value="kg"><option value="ml"><option value="dl"><option value="L"><option value="tsk"><option value="spsk"><option value="stk"><option value="blade"><option value="kviste"><option value="fed"><option value="°C"><option value="timer"></datalist>';
    list.querySelectorAll("input[data-field]").forEach(function(inp){
      inp.addEventListener("input",function(){
        var id=inp.dataset.ingId;var field=inp.dataset.field;
        var ing=(_currentDish.data.ingredients||[]).find(function(x){return x.id===id;});
        if(ing&&field)ing[field]=inp.value;
        if(field==="name"){var c=$("#dsIngCount");if(c)c.textContent=(_currentDish.data.ingredients||[]).length||"";}
        markDirty();
      });
    });
    list.querySelectorAll("[data-rm-ing]").forEach(function(btn){
      btn.addEventListener("click",function(){
        var id=btn.dataset.rmIng;
        _currentDish.data.ingredients=(_currentDish.data.ingredients||[]).filter(function(x){return x.id!==id;});
        renderIngredients();markDirty();
      });
    });
  }

  function renderSteps(){
    var list=$("#stepList");if(!list||!_currentDish)return;
    var steps=_currentDish.data.steps||[];
    var dsCount=$("#dsStepsCount");if(dsCount)dsCount.textContent=steps.length?(steps.length+(lang==="da"?" trin":" steps")):"";
    list.innerHTML=steps.map(function(s,i){
      return '<div class="step-row" data-step-id="'+esc(s.id)+'">'
        +'<div class="step-num">'+(i+1)+'</div>'
        +'<div class="step-body">'
        +'<textarea class="input step-txt" placeholder="'+t("lab_ph_step")+'" data-field="text" data-step-id="'+esc(s.id)+'">'+esc(s.text||"")+'</textarea>'
        +'<div class="step-meta">'
        +'<div style="position:relative"><input class="input" type="number" placeholder="°C" value="'+esc(s.temp||"")+'" data-field="temp" data-step-id="'+esc(s.id)+'" style="padding-right:26px"><span style="position:absolute;right:8px;top:50%;transform:translateY(-50%);font-size:10px;color:var(--faint);pointer-events:none">°C</span></div>'
        +'<div style="position:relative"><input class="input" type="number" placeholder="tid" value="'+esc(s.time||"")+'" data-field="time" data-step-id="'+esc(s.id)+'" style="padding-right:26px"><span style="position:absolute;right:8px;top:50%;transform:translateY(-50%);font-size:10px;color:var(--faint);pointer-events:none">min</span></div>'
        +'<button class="ing-rm" data-rm-step="'+esc(s.id)+'">×</button>'
        +'</div></div></div>';
    }).join("");
    list.querySelectorAll("input[data-field],textarea[data-field]").forEach(function(inp){
      inp.addEventListener("input",function(){
        var id=inp.dataset.stepId;var field=inp.dataset.field;
        var step=(_currentDish.data.steps||[]).find(function(x){return x.id===id;});
        if(step&&field)step[field]=inp.value;markDirty();
      });
    });
    list.querySelectorAll("[data-rm-step]").forEach(function(btn){
      btn.addEventListener("click",function(){
        var id=btn.dataset.rmStep;
        _currentDish.data.steps=(_currentDish.data.steps||[]).filter(function(x){return x.id!==id;});
        renderSteps();markDirty();
      });
    });
  }

  function renderTestRounds(){
    var list=$("#testList");if(!list||!_currentDish)return;
    var rounds=_currentDish.data.testRounds||[];
    var dsCount=$("#dsTestCount");if(dsCount)dsCount.textContent=rounds.length?(rounds.length+(lang==="da"?" runder":" rounds")):"";
    list.innerHTML=rounds.map(function(r,i){
      var stars=[1,2,3,4,5].map(function(n){return '<span class="test-star" data-round-id="'+esc(r.id)+'" data-star="'+n+'">'+(n<=(r.rating||0)?"★":"☆")+'</span>';}).join("");
      return '<div class="test-round" data-round-id="'+esc(r.id)+'">'
        +'<div class="test-round-hd">'
        +'<span class="test-round-date">'+(lang==="da"?"Runde":"Round")+" "+(i+1)+'</span>'
        +'<input type="date" class="input" value="'+esc(r.date||"")+'" data-field="date" data-round-id="'+esc(r.id)+'" style="font-size:12px;padding:4px 8px;width:auto">'
        +'<div class="test-stars">'+stars+'</div>'
        +'<button class="ing-rm" data-rm-round="'+esc(r.id)+'">×</button>'
        +'</div>'
        +'<textarea class="input" rows="2" placeholder="'+(lang==="da"?"Hvad gik godt? Hvad justeres næste gang?":"What worked? What needs adjusting?")+'" data-field="notes" data-round-id="'+esc(r.id)+'" style="resize:vertical;width:100%;font-size:13px">'+esc(r.notes||"")+'</textarea>'
        +'</div>';
    }).join("");
    list.querySelectorAll("input[data-field],textarea[data-field]").forEach(function(inp){
      inp.addEventListener("input",function(){
        var id=inp.dataset.roundId;var field=inp.dataset.field;
        var round=(_currentDish.data.testRounds||[]).find(function(x){return x.id===id;});
        if(round&&field)round[field]=inp.value;markDirty();
      });
    });
    list.querySelectorAll(".test-star").forEach(function(star){
      star.addEventListener("click",function(){
        var id=star.dataset.roundId;var val=parseInt(star.dataset.star)||0;
        var round=(_currentDish.data.testRounds||[]).find(function(x){return x.id===id;});
        if(round){round.rating=round.rating===val?0:val;renderTestRounds();markDirty();}
      });
    });
    list.querySelectorAll("[data-rm-round]").forEach(function(btn){
      btn.addEventListener("click",function(){
        var id=btn.dataset.rmRound;
        _currentDish.data.testRounds=(_currentDish.data.testRounds||[]).filter(function(x){return x.id!==id;});
        renderTestRounds();markDirty();
      });
    });
  }

  function renderPhotoGallery(){
    var grid=$("#dePhotoGrid");if(!grid||!_currentDish)return;
    var photos=_currentDish.data.photos||[];
    var dsCount=$("#dsPhotosCount");if(dsCount)dsCount.textContent=photos.length?photos.length+"":"";
    grid.innerHTML=photos.map(function(p,i){return '<img class="photo-thumb-de" src="'+esc(p.url)+'" data-photo-idx="'+i+'" loading="lazy" alt="">';}).join("")
      +'<div class="photo-add-tile" id="dePhotoAddTile">+</div>';
    grid.querySelectorAll(".photo-thumb-de").forEach(function(img){
      img.addEventListener("click",function(){
        var idx=parseInt(img.dataset.photoIdx);
        if(confirm(lang==="da"?"Slet dette billede?":"Delete this photo?")){_currentDish.data.photos.splice(idx,1);renderPhotoGallery();markDirty();}
      });
    });
    var addTile=$("#dePhotoAddTile");
    if(addTile)addTile.addEventListener("click",function(){var inp=$("#dePhotoInput");if(inp)inp.click();});
  }

  function openAiSheet(prefill){
    var scrim=$("#aiScrim");var resp=$("#aiResponse");var loading=$("#aiLoading");
    if(!scrim)return;
    if(resp){resp.style.display="none";resp.textContent="";}
    if(loading)loading.style.display="none";
    var aiInput=$("#aiInput");if(aiInput)aiInput.value="";
    var chipsEl=$("#aiChips");
    if(chipsEl){
      var chips=lang==="da"?["Hvad mangler i denne ret?","Foreslå smagsparringer","Vinforslag til retten","Idéer til anretning","Gør retten mere sæsonbetonet","Fermentering eller syrningsidéer"]:["What's missing from this dish?","Suggest flavor pairings","Wine pairing suggestions","Plating ideas","Make it more seasonal","Fermentation or curing ideas"];
      chipsEl.innerHTML=chips.map(function(c){return '<button class="ai-chip">'+esc(c)+'</button>';}).join("");
      chipsEl.querySelectorAll(".ai-chip").forEach(function(chip){
        chip.addEventListener("click",function(){var inp=$("#aiInput");if(inp)inp.value=chip.textContent;sendAiMessage();});
      });
    }
    if(prefill&&prefill.length){var aiInput2=$("#aiInput");if(aiInput2)aiInput2.value=prefill;setTimeout(sendAiMessage,80);}
    scrim.classList.add("open");
  }

  function closeAiSheet(){var scrim=$("#aiScrim");if(scrim)scrim.classList.remove("open");}

  async function sendAiMessage(){
    var aiInput=$("#aiInput");var question=(aiInput&&aiInput.value||"").trim();if(!question)return;
    var resp=$("#aiResponse");var loading=$("#aiLoading");var sendBtn=$("#aiSendBtn");
    if(resp){resp.style.display="none";resp.textContent="";}
    if(loading)loading.style.display="flex";if(sendBtn)sendBtn.disabled=true;
    var base=apiBase();var token=await getToken();
    try{
      var r=await fetch(base+"/api/lab/dishes/ai",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({dish:_currentDish,question:question})});
      var d=await r.json();
      if(loading)loading.style.display="none";
      if(resp){resp.textContent=d.answer||"";resp.style.display="block";}
    }catch(e){
      if(loading)loading.style.display="none";
      if(resp){resp.textContent=lang==="da"?"AI er ikke tilgængelig nu. Prøv igen.":"AI unavailable. Try again.";resp.style.display="block";}
    }
    if(sendBtn)sendBtn.disabled=false;
  }

  async function loadLabDishes(){
    var list=$("#labList");if(!list)return;
    list.innerHTML='<div style="display:flex;justify-content:center;padding:36px"><div class="lab-spinner"></div></div>';
    var base=apiBase();var token=await getToken();
    if(!base||!token){list.innerHTML='<div class="empty-state"><div class="empty-state-icon">🍳</div><div class="empty-state-title">'+(lang==="da"?"Ingen retter endnu":"No dishes yet")+'</div><div class="empty-state-sub">'+(lang==="da"?"Tryk \"Ny ret\" for at starte":"Tap \"New dish\" to start")+'</div></div>';return;}
    try{
      var r=await fetch(base+"/api/lab/dishes",{headers:{"Authorization":"Bearer "+token}});
      var d=await r.json();
      _labDishes=d.dishes||[];renderLabList();
    }catch(e){list.innerHTML="";}
  }

  function renderLabList(){
    if(_labSeg!=="mine")return;
    var list=$("#labList");if(!list)return;
    var statusLabels={idea:lang==="da"?"Idé":"Idea",testing:"Test",ready:lang==="da"?"Klar":"Ready",menu:lang==="da"?"På menu":"On menu"};
    var filtered=_labFilter==="all"?_labDishes:_labDishes.filter(function(d){return d.status===_labFilter;});
    if(!filtered.length){
      list.innerHTML='<div class="empty-state"><div class="empty-state-icon">🍳</div><div class="empty-state-title">'+(lang==="da"?"Ingen retter endnu":"No dishes yet")+'</div><div class="empty-state-sub">'+(lang==="da"?"Tryk \"Ny ret\" for at starte":"Tap \"New dish\" to start")+'</div></div>';
      return;
    }
    list.innerHTML=filtered.map(function(dish){
      var d=dish.data||{};
      var meta=[];
      if(d.portions)meta.push(d.portions+(d.portionUnit?" "+d.portionUnit:""));
      if(d.season)meta.push(d.season);if(d.technique)meta.push(d.technique);
      var upd=new Date(dish.updatedAt||dish.createdAt);var now=new Date();
      var diffDays=Math.floor((now-upd)/(1000*60*60*24));
      var updTxt=diffDays===0?(lang==="da"?"I dag":"Today"):diffDays===1?(lang==="da"?"I går":"Yesterday"):(lang==="da"?"For "+diffDays+" dage siden":diffDays+" days ago");
      return '<div class="dish-card" data-dish-id="'+esc(dish.id)+'">'
        +(dish.heroUrl?'<img class="dish-card-img" src="'+esc(dish.heroUrl)+'" loading="lazy" alt="'+esc(dish.name||"")+'">'
          :'<div class="dish-card-img" style="display:flex;align-items:center;justify-content:center;font-size:36px;background:var(--bg)">🍽</div>')
        +'<div class="dish-card-body">'
        +'<div class="dish-card-top"><span class="dish-card-name">'+esc(dish.name||"Ny ret")+'</span>'
        +'<span class="dish-status dish-status-'+esc(dish.status||"idea")+'">'+esc(statusLabels[dish.status||"idea"]||dish.status)+'</span></div>'
        +'<div class="dish-card-meta">'+(meta.length?esc(meta.join(" · "))+" · ":"")+'<span>'+esc(updTxt)+'</span></div>'
        +'</div></div>';
    }).join("");
  }

  var _sharedCache=[];
  function renderLabSeg(){
    var filterRow=$("#labFilterRow");var newBtn=$("#labNewBtn");
    var mine=_labSeg==="mine";
    if(filterRow)filterRow.style.display=mine?"":"none";
    if(newBtn)newBtn.style.display=mine?"":"none";
    if(mine){loadLabDishes();}
    else loadSharedDishes(_labSeg);
  }
  async function loadSharedDishes(seg){
    var list=$("#labList");if(!list)return;
    list.innerHTML='<div style="display:flex;justify-content:center;padding:36px"><div class="lab-spinner"></div></div>';
    var base=apiBase();var token=await getToken();
    if(!base||!token){list.innerHTML="";return;}
    try{
      var r=await fetch(base+(seg==="kitchen"?"/api/lab/kitchen":"/api/lab/cookbooks"),{headers:{"Authorization":"Bearer "+token}});
      var d=await r.json();
      _sharedCache=d.dishes||[];
      renderSharedList(seg,d);
    }catch(e){list.innerHTML='<div class="empty-state"><div class="empty-state-icon">📡</div><div class="empty-state-title">'+(lang==="da"?"Kunne ikke hente":"Couldn\u2019t load")+'</div></div>';}
  }
  function renderSharedList(seg,resp){
    if(_labSeg!==seg)return;
    var list=$("#labList");if(!list)return;
    var statusLabels=_dishStatusLabels();
    if(seg==="kitchen"&&resp&&resp.noTeam){
      list.innerHTML='<div class="empty-state"><div class="empty-state-icon">👥</div><div class="empty-state-title">'+(lang==="da"?"Du er ikke på et hold endnu":"You\u2019re not on a team yet")+'</div><div class="empty-state-sub">'+(lang==="da"?"Opret eller join et hold under Rangliste → Hold, så deler I retter automatisk her":"Create or join a team under Leaderboard → Team to share dishes here")+'</div><button class="btn primary btn-sm" id="labGoTeam" style="margin-top:12px">'+(lang==="da"?"Gå til Hold":"Go to Teams")+'</button></div>';
      var go=$("#labGoTeam");if(go)go.addEventListener("click",goToTeams);
      return;
    }
    if(!_sharedCache.length){
      list.innerHTML='<div class="empty-state"><div class="empty-state-icon">'+(seg==="kitchen"?"🍳":"📖")+'</div><div class="empty-state-title">'+(seg==="kitchen"?(lang==="da"?"Ingen delte retter endnu":"No shared dishes yet"):(lang==="da"?"Ingen kogebøger endnu":"No cookbooks yet"))+'</div><div class="empty-state-sub">'+(seg==="kitchen"?(lang==="da"?"Sæt en ret til 👥 Holdet i editoren, så ser hele holdet den her":"Set a dish to 👥 Team in the editor and your whole team sees it here"):(lang==="da"?"Følg andre kokke i Feed — deres offentlige retter samles her":"Follow other chefs in Feed — their public dishes appear here"))+'</div></div>';
      return;
    }
    var groups={};var order=[];
    _sharedCache.forEach(function(d){var k=d.author||"?";if(!groups[k]){groups[k]=[];order.push(k);}groups[k].push(d);});
    list.innerHTML=order.map(function(author){
      var dishes=groups[author];
      var hdr='<div class="shift-log-head" style="margin-top:6px">'+esc(author)+' · '+dishes.length+'</div>';
      return hdr+dishes.map(function(dish){
        var vis=dish.visibility==="public"?"🌍":"👥";
        return '<div class="dish-card" data-shared-id="'+esc(dish.id)+'">'
          +(dish.heroUrl?'<img class="dish-card-img" src="'+esc(dish.heroUrl)+'" loading="lazy" alt="">'
            :'<div class="dish-card-img" style="display:flex;align-items:center;justify-content:center;font-size:36px;background:var(--bg)">🍽</div>')
          +'<div class="dish-card-body">'
          +'<div class="dish-card-top"><span class="dish-card-name">'+esc(dish.name||"")+'</span>'
          +'<span class="dish-status dish-status-'+esc(dish.status||"idea")+'">'+esc(statusLabels[dish.status||"idea"]||dish.status)+'</span></div>'
          +'<div class="dish-card-author"><span class="dish-card-avatar">'+esc((author||"?").charAt(0).toUpperCase())+'</span>'+esc(author)+(dish.teamName?' <span style="color:var(--faint)">· '+esc(dish.teamName)+'</span>':'')+'<span class="dish-vis-tag">'+vis+'</span></div>'
          +'</div></div>';
      }).join("");
    }).join("");
  }
  // Komplet, struktureret "se opskrift"-visning — bruges både til holdets delte
  // retter og til ens egne (via "Se opskrift"-knappen i editoren).
  function _dishBodyHtml(dish){
    var d=dish.data||{};var da=lang==="da";var html="";
    function sec(title,inner){return '<div class="sd-sec"><div class="sd-sec-title">'+esc(title)+'</div>'+inner+'</div>';}
    var specs=[];
    if(d.season)specs.push([da?"Sæson":"Season",d.season]);
    if(d.portions)specs.push([da?"Portioner":"Portions",d.portions+" "+(d.portionUnit||"prs")]);
    if(d.cookTime)specs.push([da?"Tilberedning":"Cook time",d.cookTime+" min"]);
    if(d.restTime)specs.push([da?"Hviletid":"Rest time",d.restTime+" min"]);
    if(d.mainTemp)specs.push([da?"Temperatur":"Temp",d.mainTemp+" °C"]);
    if(d.platingTime)specs.push([da?"Anretningstid":"Plating time",d.platingTime+" min"]);
    if(specs.length)html+='<div class="sd-spec">'+specs.map(function(s){return '<div class="sd-spec-cell"><div class="sd-spec-lbl">'+esc(s[0])+'</div><div class="sd-spec-val">'+esc(String(s[1]))+'</div></div>';}).join("")+'</div>';
    if(d.concept||d.description)html+=sec(da?"Koncept & inspiration":"Concept",'<div class="sd-text">'+esc(d.description||d.concept)+'</div>');
    if((d.ingredients||[]).length){
      html+=sec((da?"Ingredienser":"Ingredients")+" ("+d.ingredients.length+")",
        d.ingredients.map(function(i){return '<div class="sd-ing"><span class="sd-ing-amt">'+esc(((i.amount||"")+" "+(i.unit||"")).trim())+'</span><span>'+esc(i.name||"")+(i.prep?' <span class="sd-ing-prep">· '+esc(i.prep)+'</span>':'')+'</span></div>';}).join(""));
    }
    if((d.steps||[]).length){
      html+=sec(da?"Fremgangsmåde":"Method",
        d.steps.map(function(s,i){
          var meta=[];if(s.temp)meta.push(esc(s.temp)+"°C");if(s.time)meta.push(esc(s.time)+" min");
          return '<div class="sd-step"><div class="sd-step-num">'+(i+1)+'</div><div class="sd-step-body"><div class="sd-text">'+esc(s.text||s||"")+'</div>'+(meta.length?'<div class="sd-step-meta">'+meta.map(function(m){return '<span>'+m+'</span>';}).join("")+'</div>':'')+'</div></div>';
        }).join(""));
    }
    if(d.technique)html+=sec(da?"Teknik":"Technique",'<div class="sd-text">'+esc(d.technique)+'</div>');
    if(d.plating||d.platingUrl){
      var pl=(d.platingUrl?'<img class="sd-plating-img" src="'+esc(d.platingUrl)+'" loading="lazy" alt="">':'')+(d.plating?'<div class="sd-text">'+esc(d.plating)+'</div>':'');
      html+=sec(da?"Anretning":"Plating",pl);
    }
    if(d.winePairing)html+=sec(da?"Vinparring":"Wine pairing",'<div class="sd-text">'+esc(d.winePairing)+'</div>');
    if((d.testRounds||[]).length){
      html+=sec((da?"Testrunder":"Test rounds")+" ("+d.testRounds.length+")",
        d.testRounds.map(function(r,i){
          var stars=r.rating?' <span class="sd-stars">'+[1,2,3,4,5].map(function(n){return n<=r.rating?"★":"☆";}).join("")+'</span>':'';
          var date=r.date?esc(r.date):((da?"Runde ":"Round ")+(i+1));
          return '<div class="denote"><div class="denote-date">'+date+stars+'</div>'+(r.notes?'<div class="denote-text">'+esc(r.notes)+'</div>':'')+'</div>';
        }).join(""));
    }
    if((d.serviceNotes||[]).length){
      html+=sec((da?"Service-noter":"Service notes")+" ("+d.serviceNotes.length+")",
        d.serviceNotes.slice(-8).reverse().map(function(n){return '<div class="denote"><div class="denote-date">'+esc(new Date(n.ts).toLocaleDateString(da?"da-DK":"en-GB",{day:"numeric",month:"short"}))+'</div><div class="denote-text">'+esc(n.text)+'</div></div>';}).join(""));
    }
    if((d.photos||[]).length){
      html+=sec(da?"Billeder":"Photos",'<div class="sd-photos">'+d.photos.map(function(p){return '<img class="sd-photo" src="'+esc(p.url)+'" loading="lazy" alt="">';}).join("")+'</div>');
    }
    if(d.basedOn)html+='<p class="sd-based">'+(da?"Baseret på ":"Based on ")+esc(d.basedOn.name)+(d.basedOn.author?" ("+esc(d.basedOn.author)+")":"")+'</p>';
    return html||'<p class="denotes-empty">'+(da?"Ingen detaljer endnu":"No details yet")+'</p>';
  }
  function _fillDishView(dish){
    var hero=$("#sdHero");if(hero){if(dish.heroUrl){hero.src=dish.heroUrl;hero.style.display="";}else hero.style.display="none";}
    var nm=$("#sdName");if(nm)nm.textContent=dish.name||"";
    var st=$("#sdStatus");if(st){st.className="dish-status dish-status-"+(dish.status||"idea");st.textContent=_dishStatusLabels()[dish.status||"idea"]||"";}
    var body=$("#sdBody");if(body)body.innerHTML=_dishBodyHtml(dish);
  }
  function openSharedDish(dish){
    _sharedDish=dish;_viewMode="shared";
    _fillDishView(dish);
    var au=$("#sdAuthor");if(au){au.style.display="";au.textContent=(lang==="da"?"Af ":"By ")+(dish.author||"?");}
    var fork=$("#sdFork");if(fork){fork.style.display="";fork.style.flex="1";fork.textContent=lang==="da"?"Gem min version":"Save my version";fork.onclick=forkSharedDish;}
    var cls=$("#sdClose");if(cls){cls.textContent=lang==="da"?"Luk":"Close";cls.style.flex="";}
    $("#sharedDishScrim").classList.add("open");
  }
  // Ejerens egen "Se opskrift" — samme visning, uden fork/author.
  function openDishView(dish){
    _viewMode="own";
    _fillDishView(dish);
    var au=$("#sdAuthor");if(au)au.style.display="none";
    var fork=$("#sdFork");if(fork)fork.style.display="none";
    var cls=$("#sdClose");if(cls){cls.textContent=lang==="da"?"Luk":"Close";cls.style.flex="1";}
    $("#sharedDishScrim").classList.add("open");
  }
  async function forkSharedDish(){
    if(!_sharedDish)return;
    var base=apiBase();var token=await getToken();if(!base||!token)return;
    var fork=$("#sdFork");if(fork){fork.disabled=true;fork.textContent="…";}
    try{
      var data=JSON.parse(JSON.stringify(_sharedDish.data||{}));
      data.basedOn={name:_sharedDish.name,author:_sharedDish.author};
      delete data.serviceNotes;delete data.notesSummary;
      var r=await fetch(base+"/api/lab/dishes",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({name:_sharedDish.name,status:"idea",data:data})});
      var dish=await r.json();
      if(dish.heroUrl===undefined)dish.heroUrl=null;
      $("#sharedDishScrim").classList.remove("open");
      if(dish.id){
        dish.data=data;dish.visibility="private";
        _labDishes.unshift(dish);
        _labSeg="mine";
        var seg=$("#labSeg");if(seg)seg.querySelectorAll(".lab-seg-btn").forEach(function(b){b.classList.toggle("active",b.dataset.seg==="mine");});
        renderLabSeg();
        showToast(lang==="da"?"Gemt i Mine retter ✓":"Saved to My dishes ✓");haptic(40);
      }
    }catch(e){showToast(lang==="da"?"Kunne ikke gemme":"Couldn\u2019t save");}
    if(fork){fork.disabled=false;}
  }
  function updateVisChips(vis){
    document.querySelectorAll("#deVisBar .de-vis-chip").forEach(function(c){c.classList.toggle("active",c.dataset.vis===(vis||"private"));});
    var lbl=$("#deVisLbl");if(lbl)lbl.textContent=lang==="da"?"Deling":"Sharing";
    var pv=document.querySelector("#dvChipPrivate span");if(pv)pv.textContent=lang==="da"?"Privat":"Private";
    var tm=document.querySelector("#dvChipTeam span");if(tm)tm.textContent=lang==="da"?"Holdet":"Team";
    var pb=document.querySelector("#dvChipPublic span");if(pb)pb.textContent=lang==="da"?"Offentlig":"Public";
  }
  async function setDishVisibility(vis){
    if(!_currentDish)return;
    var cur=_currentDish.visibility||"private";
    if(vis===cur)return;
    if(vis==="team"){
      var teams=await _labTeams();
      if(!teams.length){showToast(lang==="da"?"Opret eller join et hold under Rangliste først":"Create or join a team under Leaderboard first");return;}
      var shared=_labDishes.filter(function(d){return d.id!==_currentDish.id&&(d.visibility==="team"||d.visibility==="public");}).length;
      if(shared>=FREE_TEAM_SHARES){openLabPro();return;}
      if(teams.length===1)_currentDish.teamId=teams[0].id;
      else{
        var picked=await pickTeam(teams);
        if(!picked)return;
        _currentDish.teamId=picked.id;
      }
    }
    if(vis==="public"){
      var pub=_labDishes.filter(function(d){return d.id!==_currentDish.id&&d.visibility==="public";}).length;
      if(pub>=FREE_PUBLIC){openLabPro();return;}
      var teams2=await _labTeams();
      if(teams2.length&&!_currentDish.teamId)_currentDish.teamId=teams2[0].id;
    }
    var firstPublish=vis==="public"&&cur!=="public";
    track("dish_share",{v:vis});
    _currentDish.visibility=vis;
    updateVisChips(vis);markDirty();saveDish(false);
    var local=_labDishes.find(function(d){return d.id===_currentDish.id;});
    if(local){local.visibility=vis;local.teamId=_currentDish.teamId||null;}
    if(vis==="team")showToast(lang==="da"?"Deles nu med holdet 👥":"Now shared with your team 👥");
    if(firstPublish){
      showToast(lang==="da"?"Publiceret i din kogebog 🌍":"Published to your cookbook 🌍");
      syncLogEntry(lang==="da"?"Ret publiceret":"Dish published",1,_currentDish.heroUrl||null,false,(lang==="da"?"📖 Publicerede \"":"📖 Published \"")+(_currentDish.name||"")+(lang==="da"?"\" i kogebogen":"\" to the cookbook"));
    }
    if(vis==="private")showToast(lang==="da"?"Retten er privat igen 🔒":"Dish is private again 🔒");
  }
  function pickTeam(teams){
    return new Promise(function(resolve){
      var scrim=$("#teamPickScrim");var list=$("#teamPickList");if(!scrim||!list){resolve(teams[0]);return;}
      var ttl=$("#teamPickTitle");if(ttl)ttl.textContent=lang==="da"?"Del med hvilket hold?":"Share with which team?";
      list.innerHTML="";
      teams.forEach(function(tm){
        var b=document.createElement("button");b.className="btn ghost";b.style.cssText="width:100%;margin-bottom:8px;justify-content:flex-start";
        b.textContent="👥 "+(tm.name||"?");
        b.addEventListener("click",function(){scrim.classList.remove("open");resolve(tm);});
        list.appendChild(b);
      });
      var cancel=$("#teamPickCancel");
      if(cancel){cancel.textContent=lang==="da"?"Annuller":"Cancel";cancel.onclick=function(){scrim.classList.remove("open");resolve(null);};}
      scrim.classList.add("open");
    });
  }
  var _proWaitJoined=localStorage.getItem("mise_pro_waitlist")==="1";
  function openLabPro(){
    track("pro_wall");
    var t1=$("#labProTitle");if(t1)t1.textContent="Lab Pro";
    var sub=$("#labProSub");if(sub)sub.textContent=lang==="da"?"Du har nået grænsen for delte retter på gratis-planen":"You\u2019ve reached the free plan\u2019s sharing limit";
    var feats=$("#labProFeats");
    if(feats)feats.innerHTML=[
      ["♾️",lang==="da"?"Ubegrænset deling med dit hold":"Unlimited team sharing"],
      ["📖",lang==="da"?"Ubegrænset offentlig kogebog":"Unlimited public cookbook"],
      ["🤖",lang==="da"?"AI-opsummeringer af service-noter":"AI service-note summaries"],
    ].map(function(f){return '<div class="labpro-feat"><span class="labpro-feat-ic">'+f[0]+'</span><span>'+f[1]+'</span></div>';}).join("");
    var ok=$("#labProOk");
    if(ok)ok.textContent=_proWaitJoined
      ?(lang==="da"?"Du er på listen ✓":"You\u2019re on the list ✓")
      :(lang==="da"?"Skriv mig op — giv besked når Pro lander":"Sign me up — tell me when Pro lands");
    $("#labProScrim").classList.add("open");
  }
  // ── Service-noter ──
  function renderServiceNotes(){
    if(!_currentDish)return;
    var notes=(_currentDish.data||{}).serviceNotes||[];
    var cnt=$("#dsServiceCount");if(cnt)cnt.textContent=notes.length?String(notes.length):"";
    var ttl=$("#dsTitleService");if(ttl)ttl.textContent=lang==="da"?"Service-noter":"Service notes";
    var listEl=$("#deNotesList");
    if(listEl)listEl.innerHTML=notes.slice(-20).reverse().map(function(n){
      return '<div class="denote"><div class="denote-date">'+esc(new Date(n.ts).toLocaleDateString(lang==="da"?"da-DK":"en-GB",{weekday:"short",day:"numeric",month:"short"}))+'</div><div class="denote-text">'+esc(n.text)+'</div></div>';
    }).join("");
    var empty=$("#deNotesEmpty");
    if(empty){empty.style.display=notes.length?"none":"";empty.textContent=lang==="da"?"Når retten er På menu, spørger appen efter noter når du afslutter en vagt — de samles her.":"When the dish is On menu, the app asks for notes when you end a shift — they collect here.";}
    var sumEl=$("#deNotesSummary");var sum=(_currentDish.data||{}).notesSummary;
    if(sumEl){
      if(sum&&sum.text){sumEl.style.display="";sumEl.innerHTML='<span class="dns-lbl">'+(lang==="da"?"AI-opsummering":"AI summary")+' · '+esc(new Date(sum.ts).toLocaleDateString(lang==="da"?"da-DK":"en-GB",{day:"numeric",month:"short"}))+'</span>'+esc(sum.text);}
      else sumEl.style.display="none";
    }
    var aiBtn=$("#notesAiBtn");if(aiBtn)aiBtn.style.display=notes.length>=2?"":"none";
    var aiLbl=$("#notesAiBtnLbl");if(aiLbl)aiLbl.textContent=lang==="da"?"Opsummér noter med AI":"Summarize notes with AI";
  }
  async function summarizeServiceNotes(){
    if(!_currentDish)return;
    var notes=(_currentDish.data||{}).serviceNotes||[];
    if(notes.length<2)return;
    var base=apiBase();var token=await getToken();if(!base||!token)return;
    var btn=$("#notesAiBtn");if(btn)btn.classList.add("loading");
    try{
      var r=await fetch(base+"/api/lab/notes-summary",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({name:_currentDish.name,notes:notes,lang:lang})});
      var d=await r.json();
      if(d.summary){_currentDish.data.notesSummary={text:d.summary,ts:Date.now()};markDirty();saveDish(false);renderServiceNotes();}
    }catch(e){showToast(lang==="da"?"AI er ikke tilgængelig nu":"AI unavailable right now");}
    if(btn)btn.classList.remove("loading");
  }

  function compressPhoto(file){
    return new Promise(resolve=>{
      const reader=new FileReader();
      reader.onload=e=>{
        const img=new Image();
        img.onload=()=>{
          const MAX=900;let w=img.width,h=img.height;
          if(w>MAX||h>MAX){if(w>h){h=Math.round(h*MAX/w);w=MAX;}else{w=Math.round(w*MAX/h);h=MAX;}}
          const c=document.createElement("canvas");c.width=w;c.height=h;
          c.getContext("2d").drawImage(img,0,0,w,h);
          resolve(c.toDataURL("image/jpeg",0.72));
        };
        img.src=e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }


  function fixScrollPadding(){
    var hdr=document.getElementById("appHeader");
    var scroll=document.getElementById("appScroll");
    if(hdr&&scroll&&window.innerWidth<=600){
      scroll.style.paddingTop=(hdr.offsetHeight+10)+"px";
    }
  }
  window.addEventListener("resize",fixScrollPadding);

  function startApp(){
    $("#mainWrap").style.display="";
    try{fixScrollPadding();}catch(e){}
    try{applyProState();}catch(e){}
    // native push: spørg om tilladelse ved opstart (lille forsinkelse så boot ikke forstyrres)
    setTimeout(()=>{try{registerNativePush(true);}catch(e){}},1400);
    document.getElementById("view-vagt").classList.add("active");
    const _sb2=document.getElementById("shiftBar"),_ss2=document.getElementById("shiftStartBtn");
    if(_sb2)_sb2.style.display="none";if(_ss2)_ss2.style.display="none";
    try{renderVagt();}catch(e){console.error("renderVagt",e);}
    try{renderCounters();}catch(e){console.error("renderCounters",e);}
    try{renderWines();}catch(e){console.error("renderWines",e);}
    try{renderCareer();}catch(e){console.error("renderCareer",e);}
    try{renderLogView();}catch(e){console.error("renderLogView",e);}
    try{setupPhoto();}catch(e){console.error("setupPhoto",e);}
    try{setupProfileModal();}catch(e){console.error("setupProfileModal",e);}
    try{setupStatsAsk();}catch(e){console.error("setupStatsAsk",e);}
    try{setupStatsToAchieveToggle();}catch(e){console.error("setupStatsToAchieveToggle",e);}
    try{setupShiftNudge();}catch(e){console.error("setupShiftNudge",e);}
    try{setupSignupSetupModal();}catch(e){console.error("setupSignupSetupModal",e);}
    try{setupShift();}catch(e){console.error("setupShift",e);}
    try{setupFeed();}catch(e){console.error("setupFeed",e);}
    try{setupLab();}catch(e){console.error("setupLab",e);}
    try{updateOfflineDot();}catch(e){}
    const profileBtn=$("#profileBtn");if(profileBtn)profileBtn.style.display="";
    try{attachAC($("#qlogInput"),()=>{
      const phrases=recentLogPhrases();
      const labels=state.counters.map(c=>tLabel(c.label));
      const subs=state.counters.flatMap(c=>c.subs.map(s=>tLabel(s.name)));
      return [...new Set([...phrases,...labels,...subs])];
    });}catch(e){console.error("attachAC",e);}
    track("app_open");
    try{loadFollowRequests();}catch(e){console.error("loadFollowRequests",e);}
    setTimeout(()=>ensurePushSubscription(),3000);
    // Deep link: ?join=KODE åbner Hold-fanen med koden udfyldt
    try{
      const _jc=new URLSearchParams(location.search).get("join");
      if(_jc&&/^[a-zA-Z0-9]{6}$/.test(_jc)){
        history.replaceState(null,"",location.pathname);
        setTimeout(()=>{
          goToTeams();
          let tries=0;
          const fill=setInterval(()=>{
            const boxes=document.querySelectorAll(".otp-box");
            if(boxes.length===6){
              clearInterval(fill);
              const code=_jc.toUpperCase();
              boxes.forEach((b,k)=>{if(k<5){b.value=code[k];b.classList.add("filled");}});
              boxes[5].value=code[5];
              boxes[5].dispatchEvent(new Event("input",{bubbles:true}));
            }else if(++tries>40)clearInterval(fill);
          },150);
        },800);
      }
    }catch(e){}
    setTimeout(()=>{
      (state.customCats||[]).filter(c=>c.iconPending&&c.name).forEach(c=>generateCatIcon(c.id,c.name));
    },1500);
    setTimeout(async()=>{
      const base=apiBase();const token=await getToken();if(!base||!token)return;
      try{
        const r=await fetch(base+"/api/user/profile",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token}});
        const d=await r.json();
        if(!r.ok||!d||d.error)return;   // fejl/401 → rør IKKE profilen (undgå falsk brugernavn-prompt)
        _isPro=!!d.pro;applyProState();
        setProfileInitial(d.nickname,d.username);
        // Vis kun brugernavn-opsætning når vi har et GYLDIGT svar der reelt mangler et.
        if(!d.username)maybeShowSignupSetup(d,"safetynet");
      }catch(e){}
    },1000);
  }

  (async function(){
    $("#mainWrap").style.display="none";
    state=await load();
    if(!Array.isArray(state.log))state.log=[];
    $("#loading").style.display="none";
    try{translateUI();}catch(e){console.error("CT:translateUI",e);}
    try{setupAuthForm();}catch(e){console.error("CT:setupAuthForm",e);}
    try{_consumeOAuthHash();}catch(e){console.error("CT:oauthHash",e);}
    let authed=false;
    try{authed=await initAuth();}
    catch(e){console.error("CT:initAuth threw",e);showAuthScreen();return;}
    if(authed){
      // Multi-bruger-guard: hører den lokale state til en ANDEN bruger på denne
      // enhed? Så ryd den, så hver konto starter rent (data hentes fra server).
      try{
        const _sub=getJwtSub();
        const _owner=localStorage.getItem("mise_state_owner");
        if(_sub&&_owner&&_owner!==_sub){
          localStorage.removeItem(STORE_KEY);localStorage.removeItem("mise_shift");
          state=clone(DEFAULTS);
        }
        if(_sub)localStorage.setItem("mise_state_owner",_sub);
      }catch(e){console.error("CT:owner-guard",e);}
      try{await pullState();}catch(e){console.error("CT:pullState",e);}
      try{startApp();}catch(e){console.error("CT:startApp threw",e);}
    }else{
      showAuthScreen();
    }
  })();
})();
