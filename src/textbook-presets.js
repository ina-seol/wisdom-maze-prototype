// Supplied lesson lists; slash alternatives are expanded into separate entries.
// Lessons 5 and 12 include examples using the supplied sentence patterns and vocabulary.
const pairs = text => text.split('\n').filter(Boolean).map(row => {
  const [english, korean] = row.split('|'); return { english, korean };
});
const lessons = [
  ['Hello, ABC!', `apple|사과
ball|공
cat|고양이
dog|개
egg|달걀
five|다섯
game|게임
hat|모자
hello|안녕
in|안에
jump|뛰다
king|왕
lion|사자
monkey|원숭이
nine|아홉
orange|오렌지
pizza|피자
queen|여왕
ring|반지
sit|앉다
six|여섯
ten|열
up|위로
violin|바이올린
wind|바람
yellow|노란색
zebra|얼룩말`, ''],
  ["Hi, I'm Momo", `be|~이다
bye|잘 가
fine|잘 지내는
how|어떻게
I|나
you|너`, `Hi.|안녕.
Hello.|안녕.
Bye.|잘 가.
I'm Momo.|나는 모모야.
How are you?|어떻게 지내?
I'm fine.|잘 지내.`],
  ["What's This?", `a|하나의
bike|자전거
cup|컵
doll|인형
it|그것
look|보다
nice|멋진
robot|로봇
that|저것
this|이것
what|무엇
yes|네`, `What's this?|이것은 무엇이니?
What's that?|저것은 무엇이니?
It's a bike.|그것은 자전거야.
Nice!|멋지다!`],
  ['Stand Up, Please', `close|닫다
come|오다
door|문
down|아래로
here|여기
okay|좋아
open|열다
please|부탁해요
stand|서다
thank|감사하다
the|그
touch|만지다`, `Sit down, please.|앉아 주세요.
Stand up, please.|일어서 주세요.
Okay.|좋아.
Thank you.|고마워.`],
  ['How Many Cows?', `cow|소
eight|여덟
four|넷
many|많은
no|아니요
one|하나
pig|돼지
right|맞는
seven|일곱
three|셋
two|둘`, `How many cows?|소가 몇 마리니?
Three cows.|소 세 마리.
That's right.|맞아.
How many pigs?|돼지가 몇 마리니?
Three pigs.|돼지 세 마리.`],
  ['Do You Have a Pencil?', `at|~에
book|책
brush|붓
do|하다
eraser|지우개
great|훌륭한
have|가지고 있다
not|~않다
pen|펜
pencil|연필
tape|테이프`, `Do you have a pencil?|연필을 가지고 있니?
Yes, I do.|응, 가지고 있어.
No, I don't.|아니, 가지고 있지 않아.
I have a brush.|나는 붓을 가지고 있어.
I don't have a brush.|나는 붓을 가지고 있지 않아.`],
  ['What Color Is It?', `black|검은색
blue|파란색
color|색
flower|꽃
green|초록색
hand|손
now|지금
pink|분홍색
red|빨간색
sorry|미안한
use|사용하다
wash|씻다
white|흰색`, `What color is it?|무슨 색이니?
It's pink.|분홍색이야.
I'm sorry.|미안해.
That's okay.|괜찮아.`],
  ['I Like Apples', `and|그리고
banana|바나나
carrot|당근
chicken|닭고기
dad|아빠
good|좋은
juice|주스
like|좋아하다
potato|감자
tomato|토마토`, `Do you like apples?|사과를 좋아하니?
Yes, I do.|응, 좋아해.
No, I don't.|아니, 좋아하지 않아.
I like carrots.|나는 당근을 좋아해.
I don't like carrots.|나는 당근을 좋아하지 않아.`],
  ["Wow, It's Big!", `big|큰
bird|새
cheese|치즈
elephant|코끼리
say|말하다
small|작은
tall|키가 큰
too|너무
tree|나무
very|매우`, `It's big.|그것은 커.
Is it a bird?|그것은 새니?
Yes, it is.|응, 맞아.
No, it isn't.|아니, 아니야.`],
  ['Can You Jump?', `can|~할 수 있다
dance|춤추다
go|가다
helmet|헬멧
high|높이
ready|준비된
run|달리다
sing|노래하다
skate|스케이트를 타다
swim|수영하다`, `Can you skate?|스케이트를 탈 수 있니?
Yes, I can.|응, 할 수 있어.
No, I can't.|아니, 할 수 없어.
I can dance.|나는 춤출 수 있어.
I can't dance.|나는 춤출 수 없어.`],
  ["He's My Dad", `brother|남자 형제
for|~을 위한
grandfather|할아버지
grandmother|할머니
he|그
mom|엄마
pretty|예쁜
she|그녀
sister|여자 형제
who|누구`, `Who's he?|그는 누구니?
Who's she?|그녀는 누구니?
He's my dad.|그는 우리 아빠야.
She's my sister.|그녀는 내 여자 형제야.
He's tall.|그는 키가 커.`],
  ["How's the Weather?", `cap|모자
cloudy|흐린
coat|코트
jacket|재킷
on|~위에
put|놓다
raining|비가 오는
sunny|화창한
snowing|눈이 오는
there|거기에
wake|깨다
weather|날씨`, `How's the weather?|날씨가 어때?
It's snowing.|눈이 와.
Put on your coat.|코트를 입어.
It's sunny.|날씨가 화창해.
It's cloudy.|날씨가 흐려.
It's raining.|비가 와.`]
];
const gradeLessons = {
  "4": [
    [
      "My Name Is Amy",
      "afternoon|오후\nbag|가방\nevening|저녁\neveryone|모두\nfriend|친구\nmeet|만나다\nmorning|아침\nname|이름\nnew|새로운\nnight|밤\nto|~로\nwe|우리",
      "What's your name?|이름이 뭐니?\nMy name is Amy.|내 이름은 에이미야.\nNice to meet you.|만나서 반가워.\nNice to meet you, too.|나도 만나서 반가워.\nGood morning.|좋은 아침이야."
    ],
    [
      "I'm Happy",
      "again|다시\nangry|화난\nhappy|행복한\nsad|슬픈\nsleepy|졸린\nsome|조금의\nthirsty|목마른\ntired|피곤한\ntry|시도하다\nwater|물",
      "Are you happy?|행복하니?\nYes, I am.|응, 그래.\nNo, I'm not.|아니, 그렇지 않아.\nI'm thirsty.|나는 목이 말라."
    ],
    [
      "Don't Sit Here",
      "careful|조심하는\ndrink|마시다\neat|먹다\nenter|들어가다\nhouse|집\nkick|차다\nline|줄\nlove|사랑하다\nover|넘어\npush|밀다\ntalk|말하다\nwelcome|환영하다",
      "Don't sit here.|여기에 앉지 마.\nOkay.|알겠어.\nBe careful.|조심해.\nDon't push.|밀지 마."
    ],
    [
      "Let's Play Basketball",
      "bad|나쁜\nbadminton|배드민턴\nbaseball|야구\nbasketball|농구\nbusy|바쁜\nlet|~하게 하다\npass|넘겨주다\nplay|놀다\nsick|아픈\nsoccer|축구\nsound|들리다\ntennis|테니스",
      "Let's play baseball.|야구하자.\nSounds good.|좋아.\nSorry, I can't.|미안하지만 할 수 없어.\nThat's too bad.|그것 참 안됐구나.\nLet's play basketball.|농구하자."
    ],
    [
      "I Want Chicken",
      "bread|빵\ncream|크림\nhelp|돕다\nhot|뜨거운\nice|얼음\nmilk|우유\nmuch|많은\nnoodles|국수\nsalad|샐러드\nsoup|수프\nwant|원하다",
      "What do you want?|무엇을 원하니?\nI want chicken.|나는 닭고기를 원해.\nHelp yourself.|마음껏 먹어.\nI want soup.|나는 수프를 원해."
    ],
    [
      "Where's My Cap?",
      "bed|침대\nbox|상자\nbus|버스\nchair|의자\ndesk|책상\nfan|선풍기\nknow|알다\ntable|탁자\nunder|아래에\nwhere|어디",
      "Where's my cap?|내 모자는 어디 있니?\nIt's on the table.|탁자 위에 있어.\nI don't know.|나는 몰라.\nIt's under the table.|탁자 아래에 있어."
    ],
    [
      "It's Wednesday",
      "art|미술\nbirthday|생일\nclass|수업\ncomputer|컴퓨터\ncook|요리하다\nday|날\nlunch|점심\nhike|하이킹하다\nparty|파티\ntoday|오늘\nwait|기다리다",
      "What day is it today?|오늘은 무슨 요일이니?\nIt's Wednesday.|수요일이야.\nI have a computer class.|나는 컴퓨터 수업이 있어.\nI have an art class.|나는 미술 수업이 있어."
    ],
    [
      "How Much Is It?",
      "car|자동차\ncase|상자\ncomic|만화\nhundred|백\nidea|생각\nskirt|치마\ntake|가져가다\nthousand|천\ntoy|장난감\nwill|~할 것이다",
      "How much is it?|얼마니?\nIt's seven hundred won.|칠백 원이야.\nI'll take it.|이것을 살게요.\nIt's one thousand won.|천 원이야."
    ],
    [
      "Is This Your Bag?",
      "bottle|병\nbrown|갈색\nclean|깨끗한\nfind|찾다\ngray|회색\nnotebook|공책\npark|공원\nshoe|신발\nso|그래서\numbrella|우산\nwatch|손목시계",
      "Is this your bag?|이것은 네 가방이니?\nYes, it is.|응, 맞아.\nNo, it isn't.|아니, 아니야.\nMy cap is gray.|내 모자는 회색이야."
    ],
    [
      "What Time Is It?",
      "breakfast|아침 식사\ndinner|저녁 식사\neleven|열하나\nfun|재미\nmovie|영화\nmusic|음악\nschool|학교\nthirty|삼십\ntime|시간\ntwelve|열둘\ntwenty|이십",
      "What time is it?|몇 시니?\nIt's ten thirty.|열 시 삼십 분이야.\nIt's time for breakfast.|아침 먹을 시간이야.\nIt's time for dinner.|저녁 먹을 시간이야."
    ],
    [
      "I'm Drawing a Picture",
      "cookie|쿠키\ndraw|그리다\nhomework|숙제\nmake|만들다\npicture|그림\nread|읽다\nsmell|냄새를 맡다\nsure|물론",
      "What are you doing?|무엇을 하고 있니?\nI'm doing homework.|나는 숙제를 하고 있어.\nCan I help you?|도와줄까?\nSure.|물론이지.\nI'm drawing a picture.|나는 그림을 그리고 있어."
    ],
    [
      "What Do You Do?",
      "cool|멋진\ndoctor|의사\nmodel|모델\nnurse|간호사\npainter|화가\npilot|조종사\nteacher|교사\nuncle|삼촌\nwriter|작가",
      "What do you do?|직업이 무엇인가요?\nI'm a doctor.|저는 의사예요.\nWhat does he do?|그의 직업은 무엇인가요?\nWhat does she do?|그녀의 직업은 무엇인가요?\nHe's a model.|그는 모델이에요.\nShe's a model.|그녀는 모델이에요."
    ]
  ],
  "5": [
    [
      "Where Are You From?",
      "about|~에 대하여\nbeautiful|아름다운\ncountry|나라\ncousin|사촌\nfrom|~에서\nguy|친구\nride|타다\nteam|팀\ntogether|함께\nwell|잘",
      "Where are you from?|어느 나라에서 왔니?\nI'm from Canada.|나는 캐나다에서 왔어.\nThis is my friend, Uju.|이 아이는 내 친구 우주야.\nNice to meet you.|만나서 반가워."
    ],
    [
      "What Are These?",
      "album|앨범\nbutton|단추\ncollect|모으다\ncut|자르다\nfork|포크\nkitchen|부엌\nlate|늦은\nmap|지도\nscissors|가위\nspoon|숟가락\nthey|그것들",
      "What are these?|이것들은 무엇이니?\nWhat are those?|저것들은 무엇이니?\nThey're buttons.|그것들은 단추야.\nHow nice!|정말 멋지다!"
    ],
    [
      "Can I Take Pictures?",
      "along|~을 따라\nanimal|동물\nborrow|빌리다\nbring|가져오다\nenergy|에너지\ngrow|자라다\njust|그냥\nlake|호수\npiano|피아노\nproblem|문제\nsee|보다\nstar|별\nvegetable|채소\nwalk|걷다",
      "Can I take pictures?|사진을 찍어도 되나요?\nYes, you can.|네, 그래도 돼요.\nNo, you can't.|아니요, 안 돼요.\nThank you.|감사합니다.\nNo problem.|천만에요."
    ],
    [
      "Whose Pen Is This?",
      "airplane|비행기\nbear|곰\nboat|배\nkey|열쇠\nold|오래된\nout|밖으로\nphone|전화기\nreturn|돌려주다\nspace|우주\ntextbook|교과서\ntiger|호랑이\ntop|꼭대기\nwith|~와 함께",
      "Whose pen is this?|이것은 누구의 펜이니?\nWhose pen is that?|저것은 누구의 펜이니?\nIt's Amy's.|에이미의 것이야.\nIt's mine.|내 것이야.\nNo, it's Uju's textbook.|아니, 그것은 우주의 교과서야."
    ],
    [
      "Let's Go Shopping",
      "around|주위에\nboard|판\nbut|하지만\ncamp|캠프\nfree|한가한\nlibrary|도서관\nmarket|시장\nneed|필요하다\nnext|다음의\nparent|부모\npresent|선물\nrabbit|토끼\nshop|쇼핑하다\nstart|시작하다\nticket|표\ntomorrow|내일\nweek|주",
      "Let's go shopping.|쇼핑하러 가자.\nSounds good.|좋아.\nSorry, but I'm busy.|미안하지만 나는 바빠.\nHow about at two twenty?|두 시 이십 분은 어때?"
    ],
    [
      "What Will You Do This Summer?",
      "banh mi|반미\nbeach|해변\ndelicious|맛있는\njoin|참가하다\nlearn|배우다\nlive|살다\nproject|프로젝트\nscience|과학\nsport|운동\nsummer|여름\nvisit|방문하다",
      "What will you do this summer?|이번 여름에 무엇을 할 거니?\nI'll join a science camp.|나는 과학 캠프에 참가할 거야.\nHave a good time.|즐거운 시간 보내.\nI'll visit the beach.|나는 해변을 방문할 거야."
    ],
    [
      "I Went to a Watermelon Festival",
      "chocolate|초콜릿\nfamily|가족\nfestival|축제\ngrape|포도\nlast|지난\npick|따다\nsea|바다\nwatermelon|수박\nweekend|주말\nyear|해\nyesterday|어제",
      "What did you do this summer?|이번 여름에 무엇을 했니?\nI swam in the sea.|나는 바다에서 수영했어.\nHow was your weekend?|주말은 어땠니?\nIt was good.|좋았어.\nIt was great.|아주 좋았어.\nI went to a watermelon festival.|나는 수박 축제에 갔어."
    ],
    [
      "What Would You Like?",
      "all|모든\nbeef|소고기\ncake|케이크\nchip|얇게 썬 튀김\nchoose|고르다\nfeel|느끼다\nfish|생선\nfruit|과일\nmeat|고기\nor|또는\nsandwich|샌드위치\nsell|팔다\nspaghetti|스파게티\nsteak|스테이크\ntasty|맛있는\nwould|~하고 싶다",
      "What would you like?|무엇을 드시겠어요?\nI'd like a fruit salad.|과일 샐러드를 주세요.\nDo you want some more?|좀 더 먹을래?\nYes, please.|네, 주세요.\nNo, thanks.|아니요, 괜찮아요."
    ],
    [
      "They Are Twenty Thousand Won",
      "ahead|앞으로\ncheap|싼\nglass|유리\nglove|장갑\nonly|오직\npants|바지\nribbon|리본\nsale|할인 판매\nsock|양말",
      "How much are the pants?|바지는 얼마인가요?\nThey're twenty thousand won.|이만 원이에요.\nWhat color do you want?|어떤 색을 원하세요?\nI want red, please.|빨간색으로 주세요."
    ],
    [
      "What Time Do You Get Up?",
      "bake|굽다\nearly|일찍\nfresh|신선한\nget|얻다\nhome|집\nhour|시간\njob|직업\npractice|연습하다\nreally|정말\nstudy|공부하다\ntonight|오늘 밤",
      "What time do you get up?|몇 시에 일어나니?\nI get up at 8.|나는 여덟 시에 일어나.\nReally?|정말?\nI get up early.|나는 일찍 일어나."
    ],
    [
      "My Favorite Subject Is Math",
      "difficult|어려운\ndrone|드론\nfavorite|가장 좋아하는\nfood|음식\nmath|수학\nspeak|말하다\nsubject|과목\nthing|것",
      "What's your favorite subject?|가장 좋아하는 과목은 뭐니?\nMy favorite subject is math.|내가 가장 좋아하는 과목은 수학이야.\nI'm good at drawing pictures.|나는 그림을 잘 그려.\nI'm good at math.|나는 수학을 잘해."
    ],
    [
      "What Do You Want to Be?",
      "act|연기하다\ncharacter|등장인물\ndesign|디자인하다\ndream|꿈\nfuture|미래\nlisten|듣다\npeople|사람들\nplace|장소\nstory|이야기\ntrain|기차\ntravel|여행하다\nvideo|영상",
      "What do you want to be?|무엇이 되고 싶니?\nI want to be a scientist.|나는 과학자가 되고 싶어.\nI like doing science projects.|나는 과학 프로젝트 하는 것을 좋아해.\nI like making videos.|나는 영상 만드는 것을 좋아해."
    ]
  ],
  "6": [
    [
      "What Grade Are You In?",
      "club|동아리\ndrum|드럼\nfirst|첫 번째\ngrade|학년\nguitar|기타\nhard|열심히\nluck|행운\nsecond|두 번째\nshow|보여주다\nski|스키를 타다\nsong|노래\nspell|철자를 말하다\nthird|세 번째\nwear|입다",
      "What grade are you in?|몇 학년이니?\nI'm in the sixth grade.|나는 6학년이야.\nHow do you spell your name?|네 이름의 철자는 어떻게 되니?\nL-I-N-H P-H-A-N.|엘-아이-엔-에이치 피-에이치-에이-엔."
    ],
    [
      "What Season Do You Like?",
      "also|또한\nbright|밝은\ncard|카드\nclear|맑은\ncold|추운\nfall|가을\nfield|들판\nlittle|작은\nriver|강\nseason|계절\nsky|하늘\nspring|봄\ntrip|여행\nwarm|따뜻한\nwinter|겨울",
      "What season do you like?|어떤 계절을 좋아하니?\nI like spring.|나는 봄을 좋아해.\nI can see beautiful flowers.|아름다운 꽃을 볼 수 있어.\nGood job!|잘했어!"
    ],
    [
      "When Is Your Birthday?",
      "campaign|캠페인\nearth|지구\noff|꺼진\npaper|종이\nposter|포스터\nsave|아끼다\nshirt|셔츠\nturn|돌다\ntwenty-one|스물하나\ntwenty-three|스물셋\ntwenty-two|스물둘\nwhen|언제\nworld|세계",
      "When is your birthday?|생일이 언제니?\nIt's on May 7th.|5월 7일이야.\nI can't wait!|정말 기대돼!\nTurn off the light.|불을 꺼."
    ],
    [
      "Why Are You Happy?",
      "because|왜냐하면\nbelt|띠\nbirdhouse|새집\nbreak|깨뜨리다\ncongratulation|축하\ntest|시험\nwhy|왜\nworry|걱정하다\nwrong|틀린",
      "Why are you happy?|왜 기쁘니?\nBecause I got a black belt.|검은 띠를 땄기 때문이야.\nDon't worry.|걱정하지 마.\nWhy are you worried?|왜 걱정하니?"
    ],
    [
      "Where Is ABC Library?",
      "bank|은행\nblock|블록\nhospital|병원\nhungry|배고픈\nleft|왼쪽\nrestaurant|식당\nrestroom|화장실\nstop|멈추다\nstore|가게\nstraight|곧장\ntown|마을",
      "Where is ABC Library?|ABC 도서관은 어디 있나요?\nGo straight one block and turn right at Nuri bank.|한 블록 곧장 가서 누리 은행에서 오른쪽으로 도세요.\nIt's next to the bank.|은행 옆에 있어요.\nTurn left.|왼쪽으로 도세요."
    ],
    [
      "He Has Blue Eyes",
      "aunt|이모 또는 고모\ndaughter|딸\ndress|원피스\neye|눈\nhair|머리카락\nlong|긴\nof|~의\nsame|같은\nsand|모래\nshort|짧은",
      "What does he look like?|그는 어떻게 생겼니?\nWhat does she look like?|그녀는 어떻게 생겼니?\nHe has blue eyes.|그는 파란 눈을 가지고 있어.\nShe has blue eyes.|그녀는 파란 눈을 가지고 있어.\nHe is wearing a yellow shirt and blue pants.|그는 노란 셔츠와 파란 바지를 입고 있어.\nShe is wearing a yellow shirt and blue pants.|그녀는 노란 셔츠와 파란 바지를 입고 있어."
    ],
    [
      "Can You Come to the Movie Festival?",
      "after|~후에\nbiscuit|비스킷\ncourse|과정\nlaser|레이저\nlight|빛\nnumber|숫자\nsoft|부드러운\ntell|말하다",
      "Can you come to the movie festival?|영화제에 올 수 있니?\nOf course.|물론이지.\nSorry, but I can't.|미안하지만 갈 수 없어.\nCome to the sports park at 10.|열 시에 체육 공원으로 와."
    ],
    [
      "It's Taller Than the Tree",
      "always|항상\nbaby|아기\ncatch|잡다\nclock|시계\ndribble|드리블하다\nfast|빠른\ngiraffe|기린\ngive|주다\ngoal|골\nheavy|무거운\nrace|경주\nside|옆\nstrong|강한\nthan|~보다\ntower|탑\nwin|이기다",
      "It's taller than the tree.|그것은 나무보다 더 커.\nThat's not right.|그건 맞지 않아.\nIt's heavier than the clock.|그것은 시계보다 더 무거워.\nThe giraffe is taller than the baby.|기린은 아기보다 키가 더 커."
    ],
    [
      "What Are You Going to Do?",
      "any|어떤\nchild|아이\nforest|숲\nhamburger|햄버거\nplan|계획\nprogram|프로그램\nroom|방\nstay|머무르다\ntent|텐트\nvillage|마을\nzoo|동물원",
      "What are you going to do this weekend?|이번 주말에 무엇을 할 예정이니?\nI'm going to stay home.|나는 집에 있을 거야.\nThat's a good idea.|좋은 생각이야.\nI'm going to visit the zoo.|나는 동물원에 갈 예정이야."
    ],
    [
      "How Often Do You Eat Vegetables?",
      "almost|거의\ndie|죽다\nenough|충분한\nexercise|운동하다\nhabit|습관\nhealthy|건강한\nlife|삶\nlot|많음\nmember|회원\nnothing|아무것도 없음\noften|자주\nonce|한 번\nshould|~해야 한다\ntooth|이\ntwice|두 번",
      "How often do you eat vegetables?|채소를 얼마나 자주 먹니?\nOnce a day.|하루에 한 번.\nGood for you.|잘하고 있구나.\nTwice a day.|하루에 두 번."
    ],
    [
      "Do You Know Anything About Tuho?",
      "air|공기\nboomerang|부메랑\nclever|영리한\nhit|치다\ninto|~안으로\nsari|사리",
      "Do you know anything about Tuho?|투호에 대해 알고 있니?\nYes, I do.|응, 알고 있어.\nIt's a Korean game.|한국의 놀이야.\nNo, I don't.|아니, 몰라.\nI have no idea.|전혀 모르겠어."
    ],
    [
      "We Made a Class Album",
      "boy|소년\nforget|잊다\nquiz|퀴즈\nstreet|거리\nwall|벽\nwish|바라다",
      "Did you paint the wall?|벽을 칠했니?\nYes, I did.|응, 칠했어.\nNo, I didn't.|아니, 칠하지 않았어.\nHana won the quiz.|하나가 퀴즈에서 우승했어."
    ]
  ]
};
export const TEXTBOOK_PRESETS = [3, 4, 5, 6].map(grade => ({ grade, label: `천재(함)-${grade}학년`, available: true }));
export function getTextbookPreset(grade) {
  const selected = Number(grade) === 3 ? lessons : gradeLessons[Number(grade)];
  if (!selected) throw new Error('지원하지 않는 학년입니다.');
  return Object.fromEntries(selected.map(([lessonTitle, words, expressions], index) => [
    `MAP${String(index + 1).padStart(2, '0')}`,
    { lessonTitle, words: pairs(words), expressions: pairs(expressions), ...(Number(grade) === 3 && index === 0 ? { mode: 'phonics' } : {}) }
  ]));
}
