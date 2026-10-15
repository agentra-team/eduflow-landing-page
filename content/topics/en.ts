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
}
