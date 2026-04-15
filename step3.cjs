const fs = require('fs');
let s = fs.readFileSync('src/pages/AddEnquiry.tsx','utf8');
const lines = s.split('\n');

const newStep3 = [
  '            {step===3&&(',
  '              <div className="space-y-5">',
  '                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">',
  '                  <CalendarPicker value={form.date} onChange={(v)=>update("date",v)} error={errors.date}/>',
  '                  <div className="space-y-3">',
  '                    <TimeSlots label="Start Time" slots={["07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00"]} value={form.startTime} onChange={(v)=>update("startTime",v)} disableBefore={null} error={errors.startTime}/>',
  '                    <TimeSlots label="End Time" slots={["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00"]} value={form.endTime} onChange={(v)=>update("endTime",v)} disableBefore={form.startTime} error={errors.endTime}/>',
  '                  </div>',
  '                </div>',
  '                <div className="grid grid-cols-2 gap-4">',
  '                  <Field label="PAX (Guests)" value={form.pax} onChange={(v)=>update("pax",v)} type="number" placeholder="50" required error={errors.pax}/>',
  '                  <Field label="Rate / Person" value={form.ratePerPerson} onChange={(v)=>update("ratePerPerson",v)} type="number" placeholder="600"/>',
  '                </div>',
  '                <AllPackages packages={packages} selectedPkgId={selectedPkgId} onSelect={applyPackage} services={services} setServices={setServices} menuItems={menuItems}/>',
  '              </div>',
  '            )}'
];

const result = [...lines.slice(0,137), ...newStep3, ...lines.slice(163)];
fs.writeFileSync('src/pages/AddEnquiry.tsx', result.join('\n'), 'utf8');
console.log('done lines:', result.length);
