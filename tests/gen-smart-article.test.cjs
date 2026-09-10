const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync('gen-quality-gate-v400.js','utf8'),context);
const check=context.window.GenSmartQualityGate.check;
const bodyParts=[
'정부가 재난 대응체계를 강화하고 현장 지원 범위를 확대하는 종합 대책을 발표했다. 이번 대책은 위험 상황을 조기에 발견하고 피해가 커지기 전에 필요한 인력과 장비를 배치하는 데 초점을 맞췄다.',
'관계기관은 재난 유형별 지휘 체계를 다시 정비한다. 중앙 부처와 지방자치단체가 같은 기준으로 상황을 판단할 수 있도록 정보 공유 절차를 단순화하고 공동 대응 훈련도 늘릴 계획이다.',
'예방 단계에서는 취약시설 점검이 확대된다. 오래된 시설과 이용자가 많은 장소를 우선 살피고, 현장에서 발견된 문제는 담당 기관이 기한을 정해 보완하도록 관리한다.',
'피해가 발생한 지역에는 생활 회복 지원이 이어진다. 임시 거처와 생필품 제공뿐 아니라 주민 상담, 소상공인 지원, 기반시설 복구를 하나의 지원 체계로 연결한다는 방침이다.',
'세부 시행 일정과 예산은 관계기관 협의를 거쳐 순차적으로 공개된다. 정부는 공식 발표자료에 확인된 수치와 사업 범위를 담고 지역별 여건에 따라 적용 순서를 조정할 예정이다.',
'정부는 제도 시행 이후 현장 의견과 대응 결과를 정기적으로 평가할 계획이다. 점검 과정에서 드러난 미비점은 후속 대책에 반영하고 국민이 체감할 수 있는 안전망 구축을 이어간다.'
];
const good={title:'정부, 재난 대응체계 강화하고 현장 지원 확대 추진',subtitle:'관계기관 협업과 예방 중심 정책으로 국민 안전망 보강',summary:'정부가 재난 대응체계를 강화하고 현장 지원 범위를 확대한다. 관계기관은 예방부터 대응, 회복까지 이어지는 협업 체계를 정비하고 구체적인 시행계획을 순차적으로 공개할 예정이다. 이번 조치는 현장 대응력을 높이는 데 초점을 맞췄다.',body:bodyParts.join('\n\n')+'\n\n전문가들은 계획이 실제 성과로 이어지려면 현장 인력의 업무 부담과 지역 간 자원 격차도 함께 살펴야 한다고 지적한다. 정부는 기관별 이행 상황을 공개하고 개선이 필요한 항목을 다음 점검에 반영할 예정이다.',sources:'[공식자료]\n행정안전부 · 2026-09-10\nhttps://example.go.kr/a\n\n[교차확인]\n연합뉴스\nhttps://example.com/b',factChecked:true};
const pass=check(good);assert.equal(pass.passed,true);assert.ok(pass.score>=80);assert.equal(pass.metrics.bodyUrlCount,0);assert.equal(pass.metrics.sourceCount,2);
const short=check({...good,summary:'짧은 요약',body:'관련 최신 보도입니다. https://example.com'});assert.equal(short.passed,false);assert.ok(short.required.some(x=>x.includes('본문 600자')));assert.ok(short.required.some(x=>x.includes('내부 작업문구')));
const config=fs.readFileSync('config.js','utf8');assert.ok(config.indexOf('gen-quality-gate-v400.js')<config.indexOf('gen-smart-article-v400.js'));assert.ok(!config.includes("gen-auto-draft-v351.js?v="));
const flow=fs.readFileSync('gn24-two-click-workflow-v1.js','utf8'),prepare=flow.slice(flow.indexOf('async function prepareArticle'),flow.indexOf('function scheduleAutosave'));assert.ok(prepare.includes('GenSmartArticleEngine'));assert.ok(!prepare.includes("$('nr350Approval')?.click()"));
console.log(JSON.stringify({qualityPass:pass.score,blockedScore:short.score,checks:'passed'}));
