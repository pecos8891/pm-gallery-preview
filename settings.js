// Настройки сайта хранятся в Supabase и доступны для записи только владельцу.
const settingFields = [
["brand_main","Название в логотипе"],["brand_sub","Подпись под логотипом"],
["nav_works","Меню: работы"],["nav_about","Меню: о мастере"],["nav_contact","Меню: контакты"],
["hero_kicker","Надпись над главным заголовком"],["hero_title","Главный заголовок: первая строка"],["hero_accent","Главный заголовок: золотая строка"],["hero_text","Текст главной страницы"],
["about_title","О проекте: заголовок"],["about_accent","О проекте: золотая строка"],["about_text","О проекте: описание"],
["works_title","Заголовок коллекции"],["manifesto_title","Подход: заголовок"],["manifesto_accent","Подход: золотая строка"],["manifesto_text","Подход: описание"],
["contact_title","Контакты: заголовок"],["contact_accent","Контакты: золотая строка"],["contact_text","Контакты: описание"],
["contact_phone","Телефон и WhatsApp (с кодом страны)"],
["contact_max","Ссылка на профиль MAX"]
];
const defaultSettings=Object.fromEntries(settingFields.map(([key])=>[key,key==="contact_phone"?"+79614752898":key==="contact_max"?"https://max.ru/u/f9LHodD0cOKMQiGT25vi2PJVlsUYnlIQKWIL05nfoQ5C6WfHNeq9M0hcJnU":document.querySelector(`[data-setting="${key}"]`)?.textContent||""]));
function updateContactLinks(phone){const digits=String(phone||"").replace(/\D/g,"");const valid=/^[1-9]\d{7,14}$/.test(digits);for(const id of ["whatsapp","callPhone"]){const el=document.getElementById(id);if(!el)continue;el.hidden=!valid;if(valid)el.href=id==="whatsapp"?"https://wa.me/"+digits:"tel:+"+digits}}
function updateMaxLink(value){const el=document.getElementById("maxMessenger");if(!el)return;try{const u=new URL(String(value||""));const valid=u.protocol==="https:"&&u.hostname==="max.ru"&&u.pathname.startsWith("/u/");el.hidden=!valid;if(valid)el.href=u.href}catch{el.hidden=true}}
function applySettings(settings){for(const [key] of settingFields){const value=settings[key];if(typeof value!=="string")continue;document.querySelectorAll(`[data-setting="${key}"]`).forEach(el=>el.textContent=value)}document.title=(settings.brand_main||defaultSettings.brand_main)+" — "+(settings.brand_sub||defaultSettings.brand_sub);updateContactLinks(settings.contact_phone??defaultSettings.contact_phone);updateMaxLink(settings.contact_max??defaultSettings.contact_max)}
async function loadSettings(){try{const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),3500);let response;try{response=await fetch("./site-settings.json?ts="+Date.now(),{cache:"no-store",signal:controller.signal})}finally{clearTimeout(timer)}if(!response.ok)throw new Error("HTTP "+response.status);const content=await response.json();if(content&&typeof content==="object"&&!Array.isArray(content))applySettings(content)}catch(e){console.warn("Тестовые настройки GitHub недоступны; показаны исходные тексты:",e)}}
const settingsForm=$("settingsForm");
$("settingsFields").innerHTML=settingFields.map(([key,label])=>`<label class="${["hero_text","about_text","manifesto_text","contact_text"].includes(key)?"wide":""}">${esc(label)}${["hero_text","about_text","manifesto_text","contact_text"].includes(key)?`<textarea name="${key}" maxlength="2000" rows="3"></textarea>`:`<input name="${key}" maxlength="250">`}</label>`).join("");
$("settingsToggle").onclick=async()=>{if(!authorized)return;settingsForm.classList.toggle("hidden");if(settingsForm.classList.contains("hidden"))return;$("settingsStatus").textContent="";let settings={...defaultSettings};if(db){const {data,error}=await db.from("site_settings").select("content").eq("id",1).maybeSingle();if(error){$("settingsStatus").textContent="Сначала выполните SQL из файла SETTINGS-SUPABASE.sql: "+error.message;return}settings={...settings,...(data?.content||{})}}for(const [key] of settingFields)settingsForm.elements.namedItem(key).value=settings[key]||""};
settingsForm.onsubmit=async e=>{e.preventDefault();if(!authorized||!db)return;const btn=$("settingsSave");btn.disabled=true;$("settingsStatus").textContent="Сохраняем...";try{const content=Object.fromEntries(settingFields.map(([key])=>[key,settingsForm.elements.namedItem(key).value.trim()]));const {error}=await db.from("site_settings").upsert({id:1,content},{onConflict:"id"});if(error)throw error;applySettings(content);$("settingsStatus").textContent="Готово! Настройки сохранены. Они доступны посетителям сайта."}catch(e){$("settingsStatus").textContent="Ошибка: "+errText(e)}finally{btn.disabled=false}};
updateContactLinks(defaultSettings.contact_phone);
updateMaxLink(defaultSettings.contact_max);
loadSettings();
