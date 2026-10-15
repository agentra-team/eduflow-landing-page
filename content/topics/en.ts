import { appFacts } from '@/lib/seo/app-facts'
import type { TopicCopy, TopicId } from './index'

/*
 * Nội dung trang chủ đề tiếng Anh, dịch sát bản tiếng Việt (cùng số hàng, bước, mục, câu hỏi). Mọi câu phải đúng với app
 * (đối chiếu repo eduflow-application, nhánh main, ngày viết); mọi con số đi qua lib/seo/app-facts.ts. Sản phẩm đổi thì sửa
 * ở đây trước, vì trợ lý AI trả lời theo đúng những gì trang này viết. Giao diện app là tiếng Việt: chữ tiếng Anh ở đây mô tả
 * chức năng, không trích nhãn nút.
 */
export const TOPICS_EN: Record<TopicId, TopicCopy> = {
  'test-generator': {
    name: 'AI test generator',
    metaTitle: 'AI test generator from a test blueprint',
    description: 'An AI test generator that works from your test blueprint: set a four-level matrix, let AI write the items, run quality gates, approve the test, then export.',
    keywords: ['AI test generator', 'test blueprint', 'test specification table', 'AI test generator from a blueprint'],
    eyebrow: 'Test blueprint and specification',
    h1: 'AI test generator that follows your test blueprint, approved by you before use',
    lead: 'EduFlow has AI write items to the number set in each cell of a four-level blueprint. Quality gates check the test, you edit and approve it, then export the test, the answer key and the specification for printing.',
    card: 'Set a four-level matrix, let AI write the items, run quality gates, approve, then export the test and answer key.',
    inShort:
      'An AI test generator in EduFlow starts from a test blueprint: you set a matrix of topics across four cognitive levels, AI writes the items for each cell, quality gates check the result, and you edit and approve before exporting the test, the answer key and the specification.',
    definition: {
      h2: 'What are a test blueprint and a test specification table?',
      term: 'A test blueprint',
      rest: 'is a table of topics set against four cognitive levels (recognition, comprehension, application, high application), where each cell holds the number of items for that topic at that level. The cells add up to the length of the test, so the blueprint shows which level the test leans on before a single item is written.',
      paras: [
        'A test specification table describes each item: which part it belongs to, which topic, which level, and which learning requirement of the curriculum it checks. In EduFlow the specification is a table with the columns Part, Item, Level, Topic and Learning requirement, printed together with the blueprint in the matrix and specification document.',
        'The number in each cell is the reference for the whole process: AI writes items cell by cell, the quality gate P3 checks that each cell holds the right number of items, and the specification lists the items by level and topic. That is why you settle the blueprint first and let AI write afterwards.',
      ],
    },
    table: {
      h2: 'Writing by hand, using ChatGPT, and using EduFlow',
      caption: 'A comparison of three ways to build a test from a blueprint: writing by hand, using ChatGPT or another general chat tool, and using EduFlow',
      checkedAt: '2026-10-15',
      head: ['Criterion', 'By hand', 'ChatGPT or a general tool', 'EduFlow'],
      rows: [
        [
          'Follows the number in each blueprint cell',
          'You count the items in each cell as you write.',
          'You give the number per cell in your prompt and recount the result yourself.',
          'AI writes items to the number in each cell. Gate P3 checks each cell; on a mismatch the app regenerates up to 2 times.',
        ],
        [
          'A specification comes with the test',
          'You build a separate table yourself.',
          'You can ask for a table; you adjust the layout yourself.',
          'A matrix and specification document lists every item by level, topic and learning requirement.',
        ],
        [
          'Re-checking the answers',
          'You solve each item again yourself.',
          'You can ask it to solve the items again in the conversation; you compare the results.',
          'When the matrix has application or high-application items, an independent AI pass solves them again. Answer warnings need your confirmation item by item.',
        ],
        [
          'Several test versions',
          'You shuffle items and options and build each key yourself.',
          'You can ask it to reorder; you check the key of each version yourself.',
          `Up to ${appFacts.maxTestVersions} versions (codes 101 to 124), with deterministic shuffling of items and options and a check that the key matches each version before saving.`,
        ],
        [
          'A printable file for the exam room',
          'You lay the test out in a word processor.',
          'It returns text that you paste and lay out.',
          'Export to PDF or DOCX; the test, the answer key and marking guide, and the matrix and specification are three separate documents.',
        ],
        [
          'Who approves the test',
          'You review and approve it by your school\'s process.',
          'You review the content and record the approval yourself.',
          'The test stays a proposal until you press approve; the approval evidence is saved in the version. An unapproved test can still be exported, with a DÙNG THỬ (trial) watermark.',
        ],
      ],
    },
    blocks: [
      {
        h2: 'The four cognitive levels in EduFlow',
        paras: [
          'The blueprint has four columns: recognition (NB), comprehension (TH), application (VD) and high application (VDC). You type the number of items into each cell, or use one of three quick-fill buttons that split the total across topics by a template ratio.',
        ],
        items: [
          { title: '15 minutes', text: '10 items, with a ratio of 50, 30, 20, 0 across NB, TH, VD, VDC.' },
          { title: '45 minutes, mid-term', text: '20 items, with a ratio of 40, 30, 20, 10.' },
          { title: 'End of term', text: '28 items, with a ratio of 30, 40, 20, 10.' },
          {
            title: 'Blueprint size',
            text: `A blueprint holds up to ${appFacts.matrixMaxRows} topic rows, a test up to ${appFacts.testMaxItems} items and each topic up to ${appFacts.topicMaxItems} items. The blueprint can also be imported from and exported to a CSV file, to edit in a spreadsheet.`,
          },
        ],
      },
      {
        h2: 'The quality gates of a test',
        paras: [
          `Once AI has written the items, the export step shows a gate table with ${appFacts.testGates} gates. Each row gives the gate code, the units checked (items, blueprint cells, versions), the violations and the result. A gate that checked 0 units does not count as passed: the app reports a gate error, because the input data has a problem.`,
        ],
        items: [
          { title: 'P3', text: 'Each cell holds the right number of items.' },
          { title: 'P5', text: 'Every item has exactly 4 options and 1 answer; an answer that still carries a warning needs confirmation.' },
          { title: 'P11', text: 'Every item is anchored to a learning requirement.' },
          { title: 'P10', text: 'The test has been approved by a teacher; it reads as waiting for approval until you approve.' },
          { title: 'P1, P2, P4', text: 'In this release they read as not applicable or off, because the app does not compile with LaTeX yet and items have no figures yet.' },
          {
            title: 'Cost',
            text: 'Before AI runs, the app shows a cost estimate box; cancel and no job is created and nothing is charged. How cost is calculated is explained on',
            link: { page: '/pricing', label: 'EduFlow pricing' },
          },
        ],
      },
    ],
    howTo: {
      h2: 'Build a test from a blueprint with EduFlow',
      lead: 'These steps follow the test screen of the app; each step has a detailed guide.',
      steps: [
        {
          title: 'Open the test screen',
          text: 'Click create test on the home screen, write a test in the sidebar, or new test inside a K-12 project, then pick the subject and grade. The test is created on your computer straight away.',
          doc: 'create-a-test',
        },
        {
          title: 'Set up the test',
          text: 'Pick chapters from the GDPT 2018 framework stored on your computer, the test type, the time, the form (multiple choice, or multiple choice plus essay) and the score scale. The test header is only printed on the test and never sent to AI.',
          doc: 'create-a-test',
        },
        {
          title: 'Build the blueprint across four levels',
          text: 'Type the number of items into each NB, TH, VD, VDC cell of your topics, or use quick fill. While the blueprint has no items, the generate button stays locked and says why.',
          doc: 'create-a-test',
        },
        {
          title: 'Let AI write the items',
          text: 'Click generate, read the estimated cost in the dialog, then run it. When it finishes, items are listed by topic and level in the questions step, and each item has an edit button.',
          doc: 'create-a-test',
        },
        {
          title: 'Read the quality gates and approve',
          text: 'In the export step, read the gate table, confirm each answer warning, then approve. At the K-12 level, approval is the last step, with no separate signing step.',
          doc: 'create-a-test',
        },
        {
          title: 'Export several test versions',
          text: `Choose the number of versions from 1 to ${appFacts.maxTestVersions}, switch the shuffling of items and options on or off, read the export checks, then export PDF or DOCX for the test, the answer key and the matrix.`,
          doc: 'export-test-versions',
        },
      ],
    },
    limits: {
      h2: 'What EduFlow does not do yet',
      items: [
        'True or false items, short answer items and essays with sub-parts (several parts, each with points): not available, on the roadmap. A test has two forms today: multiple choice, and multiple choice plus essay with essay tasks that carry points and a marking guide.',
        'The three levels of Official Letter 7991 (know, understand, apply): not available; the blueprint uses four levels.',
        'Figures in items and compiling LaTeX to PDF: not available. AI does not draw figures; formulas written in an item still show in the preview.',
        'Uploading a sample test for AI to analyse and rewrite: not available, on the roadmap. A blueprint can be imported from a CSV file.',
        'AI writes a proposal only: you check, edit and approve it before using it in class. Generating items needs a network connection.',
      ],
    },
    faq: [
      {
        q: 'Does the EduFlow AI test generator follow the blueprint?',
        a: 'AI writes items for each cell to the number you entered. After generating, gate P3 checks that each cell holds the right number of items; if the bank of items does not match, the app regenerates up to 2 times, and each attempt is charged. The result is still a proposal for you to read, edit and approve.',
      },
      {
        q: 'How many cognitive levels does EduFlow use?',
        a: 'Four: recognition, comprehension, application and high application. The three levels of Official Letter 7991 (know, understand, apply) are not available yet and are on the roadmap.',
      },
      {
        q: 'Can it create true or false, short answer and essay items?',
        a: 'Essays yes, in the form that combines multiple choice and essay: an essay task has points and a marking guide. A multiple-choice item has four options and one correct answer. True or false items, short answer items and essays with sub-parts (several parts, each with points) are not available yet and are on the roadmap.',
      },
      {
        q: 'Do I need to re-check the answers AI writes?',
        a: 'Yes. When the matrix has application or high-application items, the app runs one more independent AI pass that solves them again to verify the answers. An answer warning must be confirmed by you item by item, with no confirm-all button, and the test stays a proposal until you press approve.',
      },
      {
        q: 'How many versions can one test have?',
        a: `Up to ${appFacts.maxTestVersions} versions, numbered 101 to 124. The versions are built from the same test: items and correct answers stay the same, only the order of items and options changes. Building versions and exporting files run on your computer and cost nothing.`,
      },
    ],
    imageAlt: 'The EduFlow test setup screen: a topic matrix across four levels, the summary and the cost estimate',
    share: { title: 'AI test generator', subtitle: 'A four-level blueprint, a specification, quality gates and human review' },
  },
  'test-versions': {
    name: 'Shuffle test versions',
    metaTitle: 'Shuffle test versions for multiple-choice tests',
    description: 'Shuffle a multiple-choice test into several versions: questions and options reordered with a fixed key, up to 24 versions, each with its own answer key.',
    keywords: ['shuffle test versions', 'multiple test versions', 'test shuffling software'],
    eyebrow: 'Multiple test versions',
    h1: 'Shuffle test versions of a multiple-choice test, with a correct key for each',
    lead: `EduFlow shuffles a multiple-choice test written in the app: it reorders the items and the options into up to ${appFacts.maxTestVersions} versions, each with its own answer key. One thing to know before you look further: EduFlow cannot yet shuffle a test that already exists as a Word or PDF file, because the test has to be written in the app; reading an old test into the app is on the roadmap.`,
    card: 'Reorder items and options into several versions, each with its own correct key, exported to Word or PDF.',
    inShort: `To shuffle test versions in EduFlow, you build several versions from one test written in the app: the app reorders the items and the options with a fixed key, up to ${appFacts.maxTestVersions} versions per test, checks the key of each version, then exports PDF or DOCX. A test that exists only as a Word or PDF file cannot be shuffled yet.`,
    definition: {
      h2: 'What does it mean to shuffle test versions?',
      term: 'Shuffling test versions',
      rest: 'means changing the order of the items and the order of the options A, B, C, D in a test to produce several different copies, while the wording of each item and its correct answer stay the same. Each copy is a version, numbered so it can be told apart on the paper and in the key.',
      paras: [
        'Versions are used when many students sit the test in one room at the same time: neighbours no longer share the same item order and option order, so it is harder to copy. Each version needs its own key, because the same item can have B as the correct answer in version 101 and D in version 102.',
        `EduFlow numbers versions from 101: 101, 102, 103 and so on, up to ${appFacts.maxTestVersions} versions, which means codes 101 to 124. The versions are built from one test you have written, so a test that passed the quality gates and that you approved gives every version the same approved content.`,
      ],
    },
    table: {
      h2: 'By hand or in Word, general shuffling software, and EduFlow',
      caption: 'A comparison of three ways to make several versions of a multiple-choice test: by hand or in Word, with general test shuffling software, and with EduFlow',
      checkedAt: '2026-10-15',
      head: ['Criterion', 'By hand or in Word', 'General shuffling software', 'EduFlow'],
      rows: [
        [
          'The test you start from',
          'You copy the test into several files in a word processor and reorder them by hand.',
          'Differs by product; check which formats the software accepts.',
          'It shuffles a test written in the app. A test that exists as a Word or PDF file cannot be shuffled yet.',
        ],
        [
          'Number of versions',
          'It depends on your time; every extra version means more reordering and another key.',
          'Differs by product; check the limit on versions in each one.',
          `You choose from 1 to ${appFacts.maxTestVersions} versions, numbered from 101.`,
        ],
        [
          'The key for each version',
          'You build the key after each reordering and check it again.',
          'Differs by product; check whether it exports a key per version.',
          'A key per version in a separate file; before saving, the app checks the correct option letter of each version after shuffling.',
        ],
        [
          'Printing the same version again',
          'You must keep the reordered copy; reordering again gives another order.',
          'Differs by product; try exporting twice and compare.',
          'Deterministic shuffling: the same test and the same settings always give version 101 the same order, on macOS and on Windows.',
        ],
        [
          'Essay items in the test',
          'You keep their order yourself while reordering.',
          'Differs by product; check how it treats essay items.',
          'Essay items keep their order and none moves to another part; only multiple-choice items are shuffled.',
        ],
        [
          'The file for the exam room',
          'You lay out and print each version.',
          'Differs by product; check the export formats.',
          'Export to PDF or DOCX; the test, the answer key and marking guide, and the matrix and specification are three separate documents. Building versions and exporting run on your computer and cost nothing.',
        ],
      ],
    },
    blocks: [
      {
        h2: 'Two shuffle switches and deterministic shuffling',
        paras: [
          'The version panel in the export step has two tick boxes, both on by default. These settings are about how the versions are printed, not about the content of the test: changing them, or the number of versions, creates no new version, needs no new approval and changes no gate result.',
        ],
        items: [
          { title: 'Shuffle items', text: 'Reorders the items inside each part of every version. Essay items keep their order and no item moves to another part.' },
          { title: 'Shuffle options', text: 'Reorders the four options A, B, C, D of a multiple-choice item.' },
          {
            title: 'Deterministic',
            text: 'The order of a version is not random on each export. The app computes it only from the number of versions, the number of multiple-choice items and the two shuffle settings, never from the text. So printing again the next day, or exporting again after fixing a typo, gives the same version; the order changes only when you add or remove multiple-choice items or change the settings.',
          },
          { title: 'Turning one switch off', text: 'It does not change the other: the order of the one still on is the same as when both are on. With both off and one version chosen, you get exactly one test in the original order.' },
        ],
      },
      {
        h2: 'Six checks before the file is saved',
        paras: [
          'Before saving, the app runs six checks on the documents it has built and lists them under the export checks, each with the number of units checked. A check at the error level stops the save and names the check; the other levels are information for you to read before printing.',
        ],
        items: [
          { title: 'Enough items', text: 'Every version has the full number of items and all the parts.' },
          { title: 'Key matches', text: 'The correct option letter of each version matches the order of the options after shuffling.' },
          { title: 'The test does not reveal answers', text: 'The test sheet contains no answers; the answers are in a separate file.' },
          { title: 'Total points', text: 'The total printed on the test equals the score scale of the test.' },
          { title: 'No duplicate versions', text: 'If two versions are identical, the app names them and suggests turning shuffling on, adding items or lowering the number of versions. This is common with shuffling off or a very short test.' },
          { title: 'Header filled in', text: 'School, school year and, for a mid-term or end-of-term test, the term. Any missing field is printed as a dotted line for you to fill in by hand.' },
        ],
      },
    ],
    howTo: {
      h2: 'Shuffle a multiple-choice test into versions with EduFlow',
      lead: 'These steps follow the export step of the test screen; the linked guide covers every button.',
      steps: [
        {
          title: 'Write the test and approve it first',
          text: 'Versions are built from a test written in the app, so the test needs its items, has passed the quality gates and has been approved by you. An unapproved test can still be exported, but the export carries a DÙNG THỬ (trial) watermark.',
          doc: 'create-a-test',
        },
        {
          title: 'Open the export step',
          text: 'Open the test in the test screen and choose the export step. The left column is the preview, where you pick each version (101, 102...) to look at it; the right column has the version panel and the list of export checks.',
          doc: 'export-test-versions',
        },
        {
          title: 'Choose the number of versions',
          text: `Type a number in the number-of-versions box, from 1 to ${appFacts.maxTestVersions}. A number outside that range gets an error and the export buttons wait until the number is valid.`,
          doc: 'export-test-versions',
        },
        {
          title: 'Turn the two shuffle switches on or off',
          text: 'Keep shuffling of items and of options on to get different versions, or turn one off. The test and the key must be exported with the same settings; if you change them after an export, the app asks you to export both files again.',
          doc: 'export-test-versions',
        },
        {
          title: 'Read the export checks',
          text: 'Read the six checks: enough items, key matches each version, the test reveals no answers, total points, duplicate versions and header. Fix what the message asks if a line is at the error level.',
          doc: 'export-test-versions',
        },
        {
          title: 'Export PDF or DOCX',
          text: 'Choose a document (the test, the answer key and marking guide, or the matrix and specification), then export PDF or DOCX. After the export, the app reports the page count of each version; open the file and check it before printing.',
          doc: 'export-test-versions',
        },
      ],
    },
    limits: {
      h2: 'What EduFlow does not do yet',
      items: [
        'Shuffling a test that already exists as a Word or PDF file: not available. EduFlow shuffles only a test written in the app; uploading an old test for the app to read and then shuffle is on the roadmap.',
        'Only multiple-choice items have their options reordered. True or false items, short answer items and essays with sub-parts (several parts, each with points) are not available, on the roadmap; the essay tasks that exist today keep their order.',
        `A test has up to ${appFacts.maxTestVersions} versions. With shuffling off or a very short test, versions can end up identical: the app names the duplicates and does not fix them for you.`,
        'Versions change only how the test is printed, not its content: to change an item, edit it in the test and export again. An unapproved test can still be exported, with a DÙNG THỬ (trial) watermark.',
      ],
    },
    faq: [
      {
        q: 'Can EduFlow shuffle a Word or PDF test I already have?',
        a: 'Not yet. EduFlow shuffles a test written in the app, where each item has four options, one answer and a learning requirement the app can check. Reading an old test from a Word or PDF file into the app is on the roadmap, with no date.',
      },
      {
        q: 'How many versions can one test have?',
        a: `Up to ${appFacts.maxTestVersions} versions, numbered 101 to 124. You enter a number from 1 to ${appFacts.maxTestVersions}; a number outside that range gets an error and is not corrected for you.`,
      },
      {
        q: 'Is the shuffling random each time I export?',
        a: 'No. The order of each version is computed only from the number of versions, the number of multiple-choice items and the two shuffle settings, so the same test and the same settings always give version 101 the same order, on macOS and on Windows. Printing again the next day still matches the sheet already printed.',
      },
      {
        q: 'Is the key of each version correct?',
        a: 'Before saving, the app checks that the correct option letter of each version matches the order of the options after shuffling, and that the test sheet reveals no answers. The key is a separate file, exported with the same settings as the test. You should still open the files and read them before printing.',
      },
      {
        q: 'Are essay items shuffled too?',
        a: 'No. In a test that combines multiple choice and essay, essay items keep their order and none moves to another part; only the order of items and options in the multiple-choice part is shuffled.',
      },
    ],
    imageAlt: 'The export step of a test in EduFlow: a preview of version 101, the quality gate table and two items waiting for answer confirmation',
    share: { title: 'Shuffle test versions', subtitle: 'Several versions, a correct key for each' },
  },
  'lesson-plans': {
    name: 'AI lesson plan generator',
    metaTitle: 'AI lesson plan generator (Official Letter 5512)',
    description: 'An AI lesson plan generator for Official Letter 5512: four activities with aims, outputs and steps, checked against the template, reviewed by you, in Word.',
    keywords: ['AI lesson plan generator', 'Official Letter 5512 lesson plan', '5512 lesson plan template'],
    eyebrow: 'Official Letter 5512 lesson plans',
    h1: 'AI lesson plan generator for Official Letter 5512, with four activities you approve',
    lead: 'EduFlow has AI draft a 45-minute lesson plan in the structure of Official Letter 5512, with four activities in sequence. The app checks that the draft has every section and the right number of minutes, you read, edit and approve it, then export DOCX or PDF.',
    card: 'AI drafts a lesson plan in the Official Letter 5512 structure with four activities; you approve, then export Word or PDF.',
    inShort: 'An AI lesson plan generator in EduFlow starts from the GDPT 2018 curriculum framework built into the app: you pick the subject, grade, chapter and topic, AI drafts a 45-minute lesson plan in the Official Letter 5512 structure with four activities, the app checks the structure, and you edit and approve it before exporting DOCX or PDF.',
    definition: {
      h2: 'What is a lesson plan in the Official Letter 5512 format?',
      term: 'A lesson plan in the Official Letter 5512 format',
      rest: 'is a teaching plan written in the structure of Official Letter 5512: a section of aims, a section of teaching equipment and materials, then the teaching process made of four activities in sequence: opening, forming new knowledge, practice and application.',
      paras: [
        'In EduFlow every activity has its own minutes, linked learning requirements and four parts: aims, content, outputs and how it is organised. The organisation part goes through four steps: handing over the task, carrying it out, reporting and discussing, then concluding.',
        'The subject, grade, chapter, topic and learning requirements come from the GDPT 2018 curriculum framework that ships with the app and is read on your computer, with no network. Each plan is one fixed 45-minute lesson; the minutes of the activities must add up to exactly 45.',
      ],
    },
    table: {
      h2: 'Writing by hand, using ChatGPT, and using EduFlow',
      caption: 'A comparison of three ways to write a lesson plan in the Official Letter 5512 format: by hand, with ChatGPT or another general chat tool, and with EduFlow',
      checkedAt: '2026-10-15',
      head: ['Criterion', 'By hand', 'ChatGPT or a general tool', 'EduFlow'],
      rows: [
        [
          'The Official Letter 5512 structure',
          'You build the frame yourself from the template you use.',
          'You paste the structure into your prompt and check whether every section is there.',
          'A fixed structure: aims, equipment and materials, and a process with four activities in order. Gate P6 checks that the required sections are present.',
        ],
        [
          'Curriculum data',
          'You look up the framework and copy the learning requirements.',
          'You paste the chapter, topic and learning requirements into your prompt.',
          'Subject, grade, chapter, topic and learning requirements come from the GDPT 2018 framework built into the app, read on your computer. Each activity links up to six requirements.',
        ],
        [
          'Total time of the lesson',
          'You add up the minutes of the activities yourself.',
          'You ask it to split the minutes and add them up again yourself.',
          'A fixed 45-minute lesson; gate P7 checks that the minutes add up to exactly 45, and the total line updates as you edit.',
        ],
        [
          'Information about the author',
          'It stays in your own file.',
          'You decide what to write into the conversation.',
          'School, department and teacher name are only printed in the header and are never sent to AI. The lesson name and your notes are sent.',
        ],
        [
          'Who approves the plan',
          'You review and approve it by your school\'s process.',
          'You review the content and record the approval yourself.',
          'The plan stays a proposal until you press approve; at the K-12 level that is the last step. Each warning needs its own confirmation.',
        ],
        [
          'The file for your records',
          'You write it directly in a word processor.',
          'It returns text that you paste into a file and lay out.',
          'Export to DOCX or PDF. An unapproved plan can still be exported, with a DÙNG THỬ (trial) watermark.',
        ],
      ],
    },
    blocks: [
      {
        h2: 'The four activities of the plan',
        paras: [
          'A lesson plan in EduFlow is one 45-minute lesson with the four activities below, in this order. On the plan screen each activity is an editable block with its minutes, linked learning requirements and the four parts a, b, c, d.',
        ],
        items: [
          { title: 'Opening', text: 'Creates a situation that brings students into the lesson, linked to what they already know.' },
          { title: 'Forming new knowledge', text: 'Students work on the main content of the topic and produce something concrete.' },
          { title: 'Practice', text: 'Students consolidate through tasks with clear outputs and a clear way to carry them out.' },
          { title: 'Application', text: 'Students use what they learned in a new situation.' },
        ],
      },
      {
        h2: 'The plan gates and the review',
        paras: [
          'In the export step, the gate table gives each gate code, the units checked, the violations and the result. A gate that checked 0 units does not count as passed: the app reports a gate error. A missing required section or a wrong total of minutes is a blocking violation, to fix in the plan step and save.',
        ],
        items: [
          { title: 'P6', text: 'The plan has the full Official Letter 5512 structure.' },
          { title: 'P7', text: 'The total minutes equal the number of lessons times 45.' },
          { title: 'P11', text: 'Each activity is anchored to a learning requirement; an unanchored one is a warning, fixed by editing or by confirming that line.' },
          { title: 'P10', text: 'A teacher has approved the plan; it reads as waiting for approval until you press approve.' },
          { title: 'Semantic review', text: 'A separate card scores eight criteria, each as passed or not passed with a note. It is only a suggestion for the approver and locks nothing.' },
          {
            title: 'Cost',
            text: 'Before AI runs, the app shows a cost estimate box; cancel and no job is created and nothing is charged. How cost is calculated is explained on',
            link: { page: '/pricing', label: 'EduFlow pricing' },
          },
        ],
      },
    ],
    howTo: {
      h2: 'Write an Official Letter 5512 lesson plan with EduFlow',
      lead: 'These steps follow the lesson plan screen of the app; the linked guide covers every button.',
      steps: [
        {
          title: 'Choose to write a lesson and pick the lesson plan type',
          text: 'Click write a lesson on the home screen, in the sidebar, or new lesson inside a K-12 project, then choose the lesson plan type.',
          doc: 'lesson-plans',
        },
        {
          title: 'Pick the subject, grade, chapter, topic and lesson name',
          text: 'Choose from the GDPT 2018 framework built into the app. The lesson name is at most 120 characters and is sent to AI as the focus of the lesson, so do not write student names or personal details in it.',
          doc: 'lesson-plans',
        },
        {
          title: 'Fill in the plan header',
          text: 'Fill in school, department and teacher name (never sent to AI) and, if you like, your notes to AI (sent as written). Every change saves itself after about a second.',
          doc: 'lesson-plans',
        },
        {
          title: 'Let AI write the four activities',
          text: 'Click generate, read the estimated cost in the dialog, then run it. It needs a network connection; when it finishes, the screen opens the plan step.',
          doc: 'lesson-plans',
        },
        {
          title: 'Read the gate warnings and edit',
          text: 'Edit each activity, check that the total reads exactly 45 minutes, then save so the app runs the gates again. Each warning has its own confirm button, with no confirm-all button.',
          doc: 'lesson-plans',
        },
        {
          title: 'Approve and export DOCX or PDF',
          text: 'When no blocking violation is left and you have confirmed the warnings, approve, then export DOCX or PDF. An unapproved plan can still be exported, with a DÙNG THỬ (trial) watermark.',
          doc: 'lesson-plans',
        },
      ],
    },
    limits: {
      h2: 'What EduFlow does not do yet',
      items: [
        'Some subjects: the lesson dialog lists only the subjects of the GDPT 2018 framework that ships with the app. Literature, Vietnamese language, Music, Art and Experiential activities are not there; they exist only in the full pack, planned after the first release, with no date.',
        'A lesson plan template of your own school: not available. EduFlow builds one fixed Official Letter 5512 structure and cannot yet load a school sample plan to build from it.',
        'A library of sample lesson plans by subject and grade, and a school logo in the plan header: not available. The header holds only school, department and teacher name for now.',
        'AI writes a proposal only: you check, edit and approve it before using it in class. Each plan is one 45-minute lesson; generating a plan needs a network connection.',
      ],
    },
    faq: [
      {
        q: 'Does the EduFlow AI lesson plan generator follow the Official Letter 5512 structure?',
        a: 'A plan has the aims section, the equipment and materials section, and a process of four activities in order. Gate P6 checks the required sections and gate P7 checks that the minutes add up to exactly 45. The result is still a proposal for you to read, edit and approve.',
      },
      {
        q: 'Which activities does the plan contain?',
        a: 'Four, in this order: opening, forming new knowledge, practice and application. Each has minutes, linked learning requirements, aims, content, outputs and a four-step organisation.',
      },
      {
        q: 'Is my information or my students\' information sent to AI?',
        a: 'School, department and teacher name in the plan header are only printed and never sent to AI. The lesson name and your notes are sent as written, so do not put student names or personal details in them.',
      },
      {
        q: 'Which subjects can EduFlow write a plan for?',
        a: 'The subjects of the GDPT 2018 framework that ships with the app. Literature, Vietnamese language, Music, Art and Experiential activities are not available in this release; they exist only in the full pack, planned after the first release.',
      },
      {
        q: 'What format is the plan exported in, and must it be approved first?',
        a: 'DOCX or PDF. Export always works, but a plan that is unapproved, still has blocking violations or runs on a trial key carries a DÙNG THỬ (trial) watermark. An approved plan with no blocking violations on a paid key is exported without it.',
      },
    ],
    imageAlt: 'The lesson plan screen of EduFlow at the plan step: aims, equipment and four activities with minutes and linked learning requirements',
    share: { title: 'AI lesson plan generator', subtitle: 'Official Letter 5512, four activities, approved by you' },
  },
  'lesson-slides': {
    name: 'AI slide generator',
    metaTitle: 'AI slide generator for lessons, with quizzes',
    description: 'An AI slide generator for lessons: pick a GDPT 2018 topic and a look, let AI write the content with quizzes in the deck, review, then export to PDF or PPTX.',
    keywords: ['AI slide generator', 'AI lesson slides'],
    eyebrow: 'AI lesson slides',
    h1: 'AI slide generator for lessons, built from your lesson topic, with quizzes in the deck',
    lead: 'EduFlow has AI write a 16:9 slide deck for one topic of the GDPT 2018 framework, from its scope, learning requirements and lesson name, with quizzes spread through the lesson. Slides do not read your lesson plan; to get both, choose the full set to create the plan and the slides in one run. You preview, edit and approve, then export PDF or PPTX.',
    card: 'AI writes a 16:9 deck with quizzes in the lesson; you preview, check the gates, approve, then export PDF or PPTX.',
    inShort: 'An AI slide generator in EduFlow works from one topic of the GDPT 2018 framework and a look you pick: you set the number of quiz items, AI writes a 16:9 deck of about 20 to 28 content slides, and you preview, edit, check the gates, approve and export PDF or PPTX. Slides do not read the lesson plan; the full set creates both at once.',
    definition: {
      h2: 'What is an AI-written lesson deck in EduFlow?',
      term: 'An AI-written lesson deck',
      rest: 'is a 16:9 slide deck that AI drafts for one lesson, made of fixed slide types: cover, aims, content map, warm-up, knowledge, example, quick practice (the quiz items), answers, practice in class, homework, summary table, wrap-up and thank you.',
      paras: [
        'The cover, content map, answer and thank-you slides are built by the app; AI writes the rest. A deck is written for one topic, from its own scope, learning requirements and lesson name. Slides do not read the content of the lesson plan: the two are independent and share only the scope of the lesson.',
        'To get both a lesson plan and slides for the same lesson, you choose the full set when writing a lesson: the app shows one cost estimate box with each part and the total, and one run creates both. Each one carries a same-set label that points to the other.',
      ],
    },
    table: {
      h2: 'By hand in PowerPoint, general AI slide tools, and EduFlow',
      caption: 'A comparison of three ways to make lesson slides: by hand in PowerPoint, with a general AI slide tool, and with EduFlow',
      checkedAt: '2026-10-15',
      head: ['Criterion', 'By hand in PowerPoint', 'General AI slide tool', 'EduFlow'],
      rows: [
        [
          'Preparing the content',
          'You write each slide yourself.',
          'You describe the lesson in a prompt and check the content.',
          'AI writes from the scope, the learning requirements of the topic in the GDPT 2018 framework and the lesson name; a deck has about 20 to 28 content slides.',
        ],
        [
          'Quizzes in the deck',
          'You write the questions and lay them out yourself.',
          'You can ask it to write questions; you lay them out yourself.',
          'You set the number of items across four levels, from 3 to 10 in total. Quizzes are spread in groups through the lesson, each group followed by an answer slide built by the app.',
        ],
        [
          'The look',
          'You pick a PowerPoint theme or adjust it yourself.',
          'Differs by tool; check how it lets you pick a theme and colours.',
          'Eight built-in looks, your own and your school\'s looks, a main colour (it must contrast enough, at least 3:1, to read on a projector) and a designer of your own.',
        ],
        [
          'Checking before use',
          'You look at each slide and check whether text overflows.',
          'You review the whole result yourself.',
          'Gate P8 checks layouts and quiz groups, gate P9 checks that slides do not overflow; each warning needs its own confirmation before you approve.',
        ],
        [
          'Editing after export',
          'You edit text and shapes directly in PowerPoint.',
          'Differs by tool; check whether the exported file is editable.',
          'Export PDF or PPTX. A PPTX has one slide image per page with speaker notes and its text cannot be edited; to change it, edit in the app and export again.',
        ],
        [
          'A lesson plan alongside',
          'You write the lesson plan separately.',
          'You ask for a lesson plan separately if you need one.',
          'Slides do not read the lesson plan; choose the full set to create both with the same lesson scope in one run.',
        ],
      ],
    },
    blocks: [
      {
        h2: 'Quizzes in the deck',
        paras: [
          'Quizzes are set before generating, in the quiz distribution card of the setup step: four number boxes for recognition, comprehension, application and high application, or three quick-set buttons.',
        ],
        items: [
          { title: 'Number of items', text: 'The default is 8 items, split 3, 3, 2, 0 across the four levels. The total must be from 3 to 10; outside that range the generate button is locked with a reason and the app does not trim for you.' },
          { title: 'Quiz groups', text: 'Quizzes are spread in groups through the lesson: 3 groups for fewer than 8 items, 4 groups from 8 items. Each group has an answer slide right after it, built by the app from the items of that group.' },
          { title: 'Each item', text: 'A question slide holds at most two items, each with four options and one correct answer. You edit each item, its correct answer and its explanation in the slide step.' },
        ],
      },
      {
        h2: 'Slide gates, preview and the watermark',
        paras: [
          'The slide step has a grid preview of the 16:9 slides; a slide that still overflows has its own label. The export step has the slide gate table, each row giving the gate code, units checked, violations and result. A gate that checked 0 units does not count as passed.',
        ],
        items: [
          { title: 'P8', text: 'The deck has the required layouts and quiz groups; it reports a missing required part, a slide count out of range or a quiz group in the wrong place.' },
          { title: 'P9', text: 'Slides do not overflow; it reports a slide that still overflows after three rounds of rebalancing, and the app measures again when you approve.' },
          { title: 'P10', text: 'A teacher has approved the deck; it reads as waiting for approval until you press approve.' },
          { title: 'Watermark', text: 'Export always works, but a deck that is unapproved, still has blocking violations or runs on a trial key carries a DÙNG THỬ (trial) watermark.' },
          {
            title: 'Cost',
            text: 'Before AI runs, the app shows a cost estimate box; cancel and nothing is charged. How cost is calculated is explained on',
            link: { page: '/pricing', label: 'EduFlow pricing' },
          },
        ],
      },
    ],
    howTo: {
      h2: 'Make lesson slides with EduFlow',
      lead: 'These steps follow the slide screen of the app; the linked guide covers every button.',
      steps: [
        {
          title: 'Choose slides or the full set',
          text: 'Click write a lesson and choose the slide type (slides only) or the full set (lesson plan and slides), then pick the subject, grade, chapter, topic and lesson name in the GDPT 2018 framework.',
          doc: 'lesson-slides',
        },
        {
          title: 'Pick a look',
          text: 'Choose one of the eight built-in looks, your own or your school\'s, then adjust the main colour in the setup step. Changing the look does not call AI.',
          doc: 'lesson-slides',
        },
        {
          title: 'Set the number of quiz items by level',
          text: 'Type the number of items for each level or use a quick set of 6, 8 or 10 items. Fill in the header (never sent to AI) and, if you like, your notes to AI.',
          doc: 'lesson-slides',
        },
        {
          title: 'Let AI write the slide content',
          text: 'Click generate, read the estimated cost, then run it. AI runs two passes in parallel, the knowledge part and the practice part, then the app builds and measures the slides. It needs a network connection.',
          doc: 'lesson-slides',
        },
        {
          title: 'Preview and edit each slide',
          text: 'In the slide step, click a slide to edit its layout, title, content and the tasks of teacher and students; a quick practice slide lets you edit each quiz item. A slide that overflows has its own label.',
          doc: 'lesson-slides',
        },
        {
          title: 'Read the gates, approve and export',
          text: 'In the export step, read the gate table, confirm each warning, approve, then export PDF or PPTX. At the K-12 level, approval is the last step, with no separate signing step.',
          doc: 'lesson-slides',
        },
      ],
    },
    limits: {
      h2: 'What EduFlow does not do yet',
      items: [
        'An editable PPTX: not available, on the roadmap. A PPTX today has one slide image per page, 16:9, with speaker notes, and its text cannot be edited in PowerPoint.',
        'Slides that read the lesson plan of the same set to cross-check it: not available. The two are independent and share only the lesson scope. Drawn figures in slides are not available either: AI does not draw figures.',
        'Distributing a unit-wide look to every computer through a server: not available. Your school\'s looks are stored on each computer and shared between computers as exported files. A library of sample slides and lesson plans by subject and grade is not available either.',
        'Some subjects: Literature, Vietnamese language, Music, Art and Experiential activities are not there; they exist only in the full pack, planned after the first release. AI writes a proposal only: you check the content and the quiz answers before using them in class.',
      ],
    },
    faq: [
      {
        q: 'Can I make AI slides from my lesson plan?',
        a: 'EduFlow slides do not read the content of a lesson plan. AI writes the deck from the scope, the learning requirements of the topic in the GDPT 2018 framework and the lesson name. To get both, choose the full set to create the plan and the slides in one run; they are independent and share only the lesson scope.',
      },
      {
        q: 'How are quizzes placed in the slides?',
        a: 'You set the number of items across the four cognitive levels before generating, from 3 to 10 in total. Quizzes are spread in groups through the lesson, each group followed by an answer slide built by the app, and each item has four options and one correct answer. You edit each item and check the answers before use.',
      },
      {
        q: 'How many slides does a deck have, and which looks can I use?',
        a: 'About 20 to 28 content slides; outside that range the slide gate warns. There are eight built-in looks, plus your own and your school\'s looks, and a main colour you can pick as long as it contrasts enough to read on a projector.',
      },
      {
        q: 'Is the text editable after I export to PowerPoint?',
        a: 'Not yet. A PPTX today has one slide image per page with speaker notes, so its text cannot be edited in PowerPoint. An editable PPTX is on the roadmap. To change a slide, edit it in the app and export again; the app also exports PDF for presenting.',
      },
      {
        q: 'Do I need to re-check the slides AI writes?',
        a: 'Yes. AI writes a proposal only. The slide gates check layouts, quiz groups and overflow, but you read and edit the content and the quiz answers. Each warning needs its own confirmation, with no confirm-all button, and an unapproved deck is exported with a DÙNG THỬ (trial) watermark.',
      },
    ],
    imageAlt: 'The slide screen of EduFlow: a preview grid of 16:9 slides, the deck settings, the slide gate table and the PDF and PPTX export buttons',
    share: { title: 'AI slide generator', subtitle: '16:9 slides with quizzes, approved by you' },
  },
  'course-syllabus': {
    name: 'Course syllabus',
    metaTitle: 'Course syllabus: structure and how to write one',
    description: 'What a course syllabus contains and how to write learning outcomes (CLOs) and a weekly plan. EduFlow tools for courses are on the roadmap, not released.',
    keywords: ['course syllabus', 'course syllabus template', 'course syllabus structure'],
    eyebrow: 'Template and structure',
    h1: 'Course syllabus: structure, writing CLOs, and where EduFlow is heading',
    lead: 'This page explains what a course syllabus contains and how to write course learning outcomes (CLOs) and a weekly plan, so a lecturer can use it with any tool. Up front: the first EduFlow release focuses on the school (K-12) level; tools for drafting CLOs, weekly plans and syllabi for university courses are on the roadmap and not available yet.',
    card: 'What a course syllabus contains, how to write CLOs and a weekly plan; EduFlow tools for courses are on the roadmap.',
    inShort:
      'A course syllabus is the document that describes one course: general information, description, learning outcomes (CLOs), a weekly teaching plan, assessment and materials. In EduFlow, tools for drafting a course syllabus are on the roadmap and not in the first release; today the app only accepts course projects, lets you add lecture files and lets you ask the assistant about them.',
    definition: {
      h2: 'What is a course syllabus?',
      term: 'A course syllabus',
      rest: 'is the document that describes one course: what it teaches, what students can do after it, how it is taught week by week, how it is assessed and what materials it uses.',
      paras: [
        'The usual sections are course information (code, credits, contact hours, prerequisites), a short description, course learning outcomes (CLOs), a weekly teaching plan, teaching and learning methods, assessment and weights, learning materials, and course rules. The exact template, section names and order are set by each institution, so follow your own.',
        'What decides the quality of a syllabus is how three layers line up: CLOs say what students can do, the weekly plan says what is taught to reach which CLO, and the assessment says which CLO is measured and how. If a CLO has no teaching week or no assessment, the syllabus has a gap.',
      ],
    },
    table: {
      h2: 'Writing in Word, using ChatGPT, and using EduFlow',
      caption: 'A comparison of three ways to write a course syllabus: by hand in Word, with ChatGPT or another general chat tool, and with EduFlow (course tools are on the roadmap)',
      checkedAt: '2026-10-15',
      head: ['Criterion', 'By hand in Word', 'ChatGPT or a general tool', 'EduFlow'],
      rows: [
        [
          'Syllabus template',
          'You follow your institution template and fill each section.',
          'You paste your template into the prompt and check that every section is present.',
          'Not yet: the course syllabus screen is on the roadmap. The app does not build a syllabus template today.',
        ],
        [
          'Writing CLOs',
          'You pick measurable verbs and check the level yourself.',
          'You ask for CLO suggestions and check the verbs and the Bloom level yourself.',
          'Not yet: a CLO gate by Bloom level is on the roadmap. Today you check this yourself.',
        ],
        [
          'Weekly plan tied to CLOs',
          'You build the table and cross-check CLOs against each week.',
          'You ask for a table and cross-check the weeks against the CLOs.',
          'Not yet: the weekly plan and CLO tracing are on the roadmap.',
        ],
        [
          'Reusing existing lectures',
          'You open the lectures and copy points into the syllabus.',
          'You paste lecture passages into the conversation.',
          `Yes, at the level of adding documents: add PDF, Word or PowerPoint files to a course project (up to ${appFacts.documentMaxMb.course} MB and ${appFacts.documentMaxPages} pages per file); the app reads them on your machine and lets you search passages. It does not build CLOs or a syllabus from them yet.`,
        ],
        [
          'Asking questions about course materials',
          'You search the files yourself.',
          'You paste the relevant passages and ask.',
          'Yes, in a course project: the assistant picks matching passages on your machine, shows them as chips you can remove before sending, and an answer carries a Source chip that opens the exact passage.',
        ],
        [
          'Approval and sign-off',
          'Through your faculty and university process.',
          'You record the approval outside the tool.',
          'Not yet: approval through a signed package is on the roadmap. At school level, Approve is the last step.',
        ],
      ],
    },
    blocks: [
      {
        h2: 'Writing CLOs by Bloom level',
        paras: [
          'A good CLO starts with a measurable verb at the cognitive level the course aims for. The revised Bloom scale orders cognitive levels from low to high, each with typical verbs.',
        ],
        items: [
          { title: 'Remember and understand', text: 'state, list, describe, explain. Fits the foundational knowledge of the course.' },
          { title: 'Apply and analyse', text: 'apply, calculate, compare, analyse. Fits problem solving and handling cases.' },
          { title: 'Evaluate and create', text: 'evaluate, design, build, propose. Fits products, projects and capstone work.' },
          { title: 'Verbs to avoid', text: 'know, master, understand well: they cannot be measured directly, so they cannot be matched to an assessment.' },
        ],
      },
      {
        h2: 'The weekly plan and the CLO to assessment matrix',
        paras: [
          'Each week should state its learning outcome, content, teaching and learning activities, and the CLOs the week helps achieve. The weeks run without gaps, and the total hours match the course load.',
        ],
        items: [
          { title: 'CLO to assessment matrix', text: 'A table with CLOs as rows and assessment components as columns (attendance, midterm, project, final); each cell says which component measures which CLO. Every CLO needs at least one marked cell.' },
          { title: 'Tracing both ways', text: 'From a CLO you can find its teaching weeks and assessments; from an assessment you can find its CLOs. Two-way tracing is the easiest way to show a reviewer the syllabus has no gaps.' },
        ],
      },
      {
        h2: 'Where EduFlow stands on the course level',
        paras: [
          'EduFlow has three levels, school (K-12), course and programme, but the first release has drafting tools only for the school level (tests, lesson plans, slides). At course level the app lets you create a course project, add documents and ask the assistant; a course project has no drafting screen, and the first-run introduction states that course and programme features are still being developed.',
        ],
        items: [
          { title: 'Direction', text: 'On the roadmap, course tools are meant to include CLOs checked by Bloom level, a weekly plan tied to CLOs, session plans, assessments, a ten-section syllabus with a source for each paragraph, and approval through a signed package. This describes a direction, not an available feature, and it has no release date.' },
          { title: 'Available today', text: 'Document adding and the assistant already work in a course project; see the guide on adding documents.', link: { doc: 'adding-documents' } },
        ],
      },
    ],
    howTo: {
      h2: 'Writing a syllabus with EduFlow: what exists today and what is roadmap',
      lead: 'The first two steps work in the current app. The four after them are on the roadmap; they are listed so you can see the direction, and they have no guide.',
      steps: [
        {
          title: 'Available today: create a course project and add lectures',
          text: 'Create a project at course level, open Project details, press the add documents button and choose a textbook, an old syllabus or lectures. The app reads them on your machine and does not send the original files.',
          doc: 'adding-documents',
        },
        {
          title: 'Available today: ask the assistant about the course materials',
          text: 'Ask the assistant inside the course project, for example what a given week of the textbook covers. The assistant only suggests; it does not draft a syllabus and does not approve for you.',
          doc: 'using-the-assistant',
        },
        {
          title: 'Roadmap, not available: AI proposes CLOs, checked by Bloom level',
          text: 'The plan is for AI to propose a set of CLOs from your materials, with a gate (G3) catching verbs that do not match the Bloom level. Not in the app yet.',
        },
        {
          title: 'Roadmap, not available: a weekly plan tied to CLOs',
          text: 'The plan is for each week to carry a learning outcome, a Bloom level and linked CLOs, with the weeks running without gaps. Not in the app yet.',
        },
        {
          title: 'Roadmap, not available: a ten-section syllabus with sources',
          text: 'The plan is to build a ten-section syllabus in a standard template, each paragraph with its source, and a section turns approved only when the lecturer marks it passed. Not in the app yet.',
        },
        {
          title: 'Roadmap, not available: gates and approval through a signed package',
          text: 'The plan is twelve gates, G1 to G12, and a package sent to the head of department for approval. Not in the app yet.',
        },
      ],
    },
    limits: {
      h2: 'What EduFlow does not do yet',
      items: [
        'All drafting tools for courses: CLOs, weekly plans, 90 or 150 minute session plans, assessments and the ten-section syllabus. Not available, on the roadmap, with no release date. The first release focuses on the school level.',
        'The twelve course quality gates, G1 to G12, and approval through a signed package: not available. Quality gates that really run exist only at school level (tests, lesson plans, slides).',
        'Building CLOs or a syllabus from added lectures: not available. A course project only adds documents, searches passages and asks the assistant.',
        'Reading text from scanned pages or photos: not yet. The app only prepares page images on your machine; Word, PDF and PowerPoint files with a text layer are read.',
        'Deciding the syllabus content: EduFlow does not do this. Anything AI writes, when it exists, is only a proposal for the lecturer to edit and approve.',
      ],
    },
    faq: [
      {
        q: 'What sections does a course syllabus contain?',
        a: 'Usually course information, a short description, course learning outcomes (CLOs), a weekly teaching plan, teaching and learning methods, assessment and weights, learning materials and course rules. Section names and order are set by each institution, so follow your own template.',
      },
      {
        q: 'How do I write course learning outcomes (CLOs) well?',
        a: 'Start each CLO with a measurable verb at the Bloom level the course aims for, such as explain, apply, analyse or design, and avoid verbs like know or master. Every CLO should have a teaching week and an assessment so it can be traced.',
      },
      {
        q: 'Can EduFlow write a course syllabus?',
        a: 'Not yet. The first EduFlow release focuses on the school level. Tools for courses (CLOs, weekly plans, session plans, assessments, the syllabus, approval through a package) are on the roadmap with no release date. Today the app only creates a course project, adds documents and lets you ask the assistant.',
      },
      {
        q: 'What can a course project in EduFlow do today?',
        a: `Add PDF, Word, PowerPoint or image files (up to ${appFacts.documentMaxMb.course} MB and ${appFacts.documentMaxPages} pages per file), let the app read them on your machine and search passages, and ask the assistant about them. A course project has no drafting screen yet.`,
      },
      {
        q: 'Can I use ChatGPT to write a syllabus?',
        a: 'Yes, as a way to get a rough draft: paste your institution template and your requirements, then check each section, the CLO verbs and how CLOs, weeks and assessments line up. Checking and approving remain the lecturer\'s job. A fuller comparison is on the EduFlow vs ChatGPT page.',
      },
    ],
    imageAlt: 'A design preview of the EduFlow course workbench screen, on the roadmap and not in the first release: CLOs, the weekly plan and sessions on one screen',
    share: { title: 'Course syllabus', subtitle: 'Structure and writing CLOs; EduFlow course tools are on the roadmap' },
  },
  'vs-chatgpt': {
    name: 'EduFlow vs ChatGPT',
    metaTitle: 'EduFlow vs ChatGPT for tests and lesson plans',
    description: 'EduFlow vs ChatGPT for tests and lesson plans: when ChatGPT is enough, and when you need the blueprint, quality gates, test versions and sign-off of EduFlow.',
    keywords: ['ChatGPT lesson plans', 'EduFlow vs ChatGPT', 'ChatGPT prompts for lesson plans'],
    eyebrow: 'An honest comparison',
    h1: 'ChatGPT lesson plans and tests: how far it goes, and when you need EduFlow',
    lead: 'ChatGPT is a general-purpose chat assistant: you type a request, read the answer and adjust it. For ideas, single questions and quick drafts that is enough. EduFlow is a desktop app for a narrower job, drafting school-level tests, lesson plans and slides, with a blueprint, quality gates and a reviewer.',
    card: 'When ChatGPT is enough for tests and lesson plans, and when you need a blueprint, gates, test versions and a reviewer.',
    inShort:
      'ChatGPT lesson plans and tests are enough for ideas, single questions and quick drafts. EduFlow is for when you need a process: item counts held to each blueprint cell, a specification, answer re-checks, several test versions, quality gates, a reviewer, source files read on your machine and cost shown before it runs. The two tools do not exclude each other.',
    definition: {
      h2: 'How do ChatGPT and EduFlow differ?',
      term: 'ChatGPT',
      rest: 'is a general-purpose chat assistant: one open chat window for any topic, where you write a request in plain words, read the result and keep asking. Its strength is flexibility; you decide where the conversation goes and you check the result.',
      paras: [
        'EduFlow is the opposite: not an open chat but an app installed on your computer for a specific set of school-teacher jobs: building tests from a blueprint, writing lesson plans in the Official Letter 5512 structure, and making lecture slides. Each job goes through fixed steps: set up, let AI write, the machine checks the gates, you edit and approve, then export.',
        'So the right question is not which tool is better, but whether the job in front of you needs flexibility or a process. The sections below take each case in turn, with sample prompts you can use right away in ChatGPT or any chat tool.',
      ],
    },
    table: {
      h2: 'ChatGPT and EduFlow, criterion by criterion',
      caption: 'A comparison of drafting tests and lesson plans with ChatGPT (a general-purpose chat assistant) and with EduFlow, described by how a teacher works in each',
      checkedAt: '2026-10-15',
      head: ['Criterion', 'ChatGPT', 'EduFlow'],
      rows: [
        [
          'Holding to each blueprint cell',
          'You state the item count per cell in the prompt and recount the result.',
          'AI writes items to the count of each cell of the four-level blueprint. Gate P3 checks each cell; if it is off, the app regenerates up to 2 times.',
        ],
        [
          'Test specification',
          'You ask for a table and adjust its layout yourself.',
          'A Blueprint and specification document lists each item by level, topic and learning requirement.',
        ],
        [
          'Re-checking answers',
          'You ask for the items to be solved again in the chat and compare.',
          'When the blueprint has Application or High application items, an independent AI pass solves them again; answer warnings need your confirmation item by item.',
        ],
        [
          'Several test versions',
          'You ask for a reordering and check each version\'s answers yourself.',
          `Up to ${appFacts.maxTestVersions} versions (101 to 124), deterministic shuffling of items and options, and the app checks each version's answers before saving.`,
        ],
        [
          'Lesson plan structure (Official Letter 5512)',
          'You paste the structure into the prompt and check that every section is present.',
          `A fixed structure with four activities in a ${appFacts.lessonMinutes}-minute lesson; gate P6 checks the sections and gate P7 checks the total minutes.`,
        ],
        [
          'Reviewer',
          'You check the content and record the approval yourself.',
          'Tests, lesson plans and slides stay Proposed until you press Approve. Unapproved work can still be exported, but the export carries a DÙNG THỬ (trial) watermark.',
        ],
        [
          'Source data and cost',
          'You decide what to paste into the chat, and read the tool\'s own terms and prices.',
          'Source documents are read on your machine; only matching passages, shown as chips you can remove, are sent with a question. A cost estimate box appears before every AI job and Cancel costs nothing. Turn AI off for a project and nothing from it leaves the machine.',
        ],
      ],
    },
    blocks: [
      {
        h2: 'When ChatGPT is already enough',
        paras: [
          'Much lesson preparation needs no process, and a general-purpose chat assistant does it well. If your job is one of these, you may not need EduFlow.',
        ],
        items: [
          { title: 'Finding ideas', text: 'Opening scenarios, worked examples, ways to explain a hard concept.' },
          { title: 'Single questions', text: 'A few quick questions for the end of a lesson, with no need to match a blueprint.' },
          { title: 'Quick drafts', text: 'A rough draft you will keep editing in your own word processor, with no fixed structure.' },
        ],
      },
      {
        h2: 'When you need EduFlow',
        paras: [
          'EduFlow is worth using when you must hand in a standard-conforming product that someone will review: a test with a blueprint, a lesson plan in the right structure, several test versions, or slides with a quiz.',
        ],
        items: [
          { title: 'A test that follows a blueprint', text: 'Item counts per cell, the specification and answer re-checks are in the process, not something you count by hand.', link: { topic: 'test-generator' } },
          { title: 'Several test versions', text: 'Shuffled items and options in up to 24 versions, each with its own key, and a reprint gives exactly the version you printed.', link: { topic: 'test-versions' } },
          { title: 'A lesson plan in a frame', text: 'Four activities, minutes and learning requirements from the GDPT 2018 curriculum frame built into the app.', link: { topic: 'lesson-plans' } },
          { title: 'A reviewer and a record', text: 'Warnings need confirming line by line, Approve is what makes it final, and the approval is saved on the version.' },
        ],
      },
      {
        h2: 'ChatGPT prompts for lesson plans and tests: four ready-to-use samples',
        paras: [
          'These prompts are neutral and work in ChatGPT or any other chat tool. Replace the text in square brackets with your own, and do not paste student names or personal data. The result always needs you to read and edit it.',
        ],
        items: [
          { title: 'Lesson plan', text: 'Write a lesson plan for [subject], grade [grade], lesson [title], 45 minutes, in the Official Letter 5512 structure with four activities: Opening, Forming new knowledge, Practice, Application. For each activity give the minutes, objectives, content, product and how it is run.' },
          { title: 'Opening scenarios', text: 'Suggest 5 opening scenarios for the lesson [title] for grade [grade], each no longer than three sentences, tied to students\' everyday life and ending with a question that leads into the lesson.' },
          { title: 'Multiple-choice items', text: 'Write 8 multiple-choice items with four options on [topic]: 3 recall, 3 comprehension, 2 application. Each item has exactly one correct answer and a short explanation; wrong options must be plausible and not repeat each other.' },
          { title: 'Feedback on a lesson plan', text: 'Here is my lesson plan: [paste]. Point out where there is no concrete learning product or the way the activity is run is vague, and suggest how to fix it. Do not rewrite the whole lesson.' },
        ],
      },
    ],
    howTo: {
      h2: 'Using both: ChatGPT for ideas, EduFlow for a standard-conforming result',
      lead: 'The two tools complement each other. A simple way to work is to find ideas wherever you are comfortable, then bring the jobs that need a process into EduFlow.',
      steps: [
        {
          title: 'Find ideas and rough drafts in the chat tool you already use',
          text: 'Use the sample prompts above for opening ideas, examples and draft items. Do not paste student names or personal data.',
        },
        {
          title: 'Build a test from a blueprint in EduFlow',
          text: 'Set up a four-level blueprint, let AI write items for each cell, read the gate table and approve. If you need several versions, export them straight from the approved test.',
          doc: 'create-a-test',
        },
        {
          title: 'Write a 5512 lesson plan in EduFlow',
          text: 'Pick the subject, grade, chapter and topic in the GDPT 2018 frame, let AI write the four activities, check the 45-minute total and approve.',
          doc: 'lesson-plans',
        },
        {
          title: 'Ask the EduFlow assistant about what you are doing',
          text: 'The assistant in the app knows the open screen and sends only a structured summary. Use it for questions about projects and cost or to prepare a setup, not for free-ranging chat.',
          doc: 'using-the-assistant',
        },
        {
          title: 'Read the cost before you run',
          text: 'Every AI job shows a cost estimate box and you choose Run or Cancel. Work done on your machine, such as shuffling versions and exporting files, costs 0 dong.',
        },
      ],
    },
    limits: {
      h2: 'What EduFlow does not do yet',
      items: [
        'It is not a general-purpose chat assistant: the assistant in EduFlow works inside the open project and screen, answers about the app\'s own facts and the project\'s documents, and is not a replacement for an open chat window on any topic.',
        'Item types: a test currently has multiple-choice items (four options, one answer) and scored essays with marking guidance. True/false, short-answer and multi-part essay items are not available and are on the roadmap.',
        'Only the school level has drafting tools: tools for courses (CLOs, weekly plans, syllabus) and for programmes are on the roadmap and not available.',
        'It needs the app installed on macOS or Windows, a key or a trial, and an internet connection for AI to write; it does not run in a browser or on a phone.',
      ],
    },
    faq: [
      {
        q: 'Can I use ChatGPT to write lesson plans?',
        a: 'Yes, especially for finding ideas, rough drafts and feedback on a plan you already have. Check the structure, the total time and the content yourself, and do not paste student names or personal data. When you need a plan in the Official Letter 5512 structure with gates and a reviewer, EduFlow does those steps inside its process.',
      },
      {
        q: 'How is EduFlow different from ChatGPT?',
        a: 'ChatGPT is a general-purpose chat assistant; EduFlow is a desktop app for school-level tests, lesson plans and slides, with a four-level blueprint, a specification, quality gates, several test versions, a reviewer and cost shown before it runs. You can use the two side by side.',
      },
      {
        q: 'Does EduFlow replace ChatGPT?',
        a: 'No. EduFlow is not an open chat window for any topic; its assistant works inside the open project and screen. You can still use ChatGPT or another chat tool for ideas and use EduFlow for the parts that need a process.',
      },
      {
        q: 'Does my data leave my computer when I use EduFlow?',
        a: 'Source documents are read on your machine and the original files are not sent. When you generate content or ask the assistant, the setup, notes and the document passages you chose are sent so AI can write, so that step needs a connection. In a project with AI turned off, no content of the project leaves the machine.',
      },
      {
        q: 'How does EduFlow charge compared with a chat tool?',
        a: 'EduFlow shows a cost estimate box before every AI job, and Cancel costs nothing. Work done on your machine, such as shuffling versions, checking gates and exporting files, costs 0 dong. The price of ChatGPT or any other tool is set by that tool\'s provider; check their own pages.',
      },
    ],
    imageAlt: 'The EduFlow home screen with the assistant chat box: the question "What would you like to prepare today?", the working level and suggestions for tests and lesson plans',
    share: { title: 'EduFlow vs ChatGPT', subtitle: 'When ChatGPT is enough, and when you need a blueprint, gates and a reviewer' },
  },
}
