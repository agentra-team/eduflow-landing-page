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
}
