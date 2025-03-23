// グローバル変数
let constructionsData = []
let constructionCounter = 0
let processCounter = 0

// 工事種類のデータ
const constructionTypes = {
  general: {
    name: '一般工事',
    defaultUnits: ['回', 'm2', 'm3', '個', '箇所', '日', '人日'],
    defaultProcesses: [
      {
        name: '足場組立',
        unit: 'm2',
        defaultUnitPrice: 1500,
        processType: 'standard',
      },
      {
        name: '基礎工事',
        unit: 'm3',
        defaultUnitPrice: 25000,
        processType: 'standard',
      },
      {
        name: '型枠工事',
        unit: 'm2',
        defaultUnitPrice: 3500,
        processType: 'standard',
      },
    ],
  },
  electrical: {
    name: '電気工事',
    defaultUnits: ['個', 'm', '箇所', '式', '回路'],
    defaultProcesses: [
      {
        name: '配線工事',
        unit: 'm',
        defaultUnitPrice: 1200,
        processType: 'standard',
      },
      {
        name: 'コンセント取付',
        unit: '個',
        defaultUnitPrice: 3000,
        processType: 'standard',
      },
      {
        name: '照明器具取付',
        unit: '個',
        defaultUnitPrice: 5000,
        processType: 'standard',
      },
    ],
  },
  plumbing: {
    name: '配管工事',
    defaultUnits: ['m', '箇所', '式', '個'],
    defaultProcesses: [
      {
        name: '給水管工事',
        unit: 'm',
        defaultUnitPrice: 3500,
        processType: 'standard',
      },
      {
        name: '排水管工事',
        unit: 'm',
        defaultUnitPrice: 4000,
        processType: 'standard',
      },
      {
        name: '衛生器具取付',
        unit: '個',
        defaultUnitPrice: 15000,
        processType: 'standard',
      },
    ],
  },
  interior: {
    name: '内装工事',
    defaultUnits: ['m2', '箇所', '式', '枚'],
    defaultProcesses: [
      {
        name: '壁クロス貼り',
        unit: 'm2',
        defaultUnitPrice: 2000,
        processType: 'area',
      },
      {
        name: '床材施工',
        unit: 'm2',
        defaultUnitPrice: 3500,
        processType: 'area',
      },
      {
        name: '天井仕上げ',
        unit: 'm2',
        defaultUnitPrice: 2500,
        processType: 'area',
      },
    ],
  },
  exterior: {
    name: '外装工事',
    defaultUnits: ['m2', '式', '箇所'],
    defaultProcesses: [
      {
        name: '外壁塗装',
        unit: 'm2',
        defaultUnitPrice: 3000,
        processType: 'area',
      },
      {
        name: '屋根工事',
        unit: 'm2',
        defaultUnitPrice: 5000,
        processType: 'area',
      },
      {
        name: '外構工事',
        unit: '式',
        defaultUnitPrice: 150000,
        processType: 'standard',
      },
    ],
  },
  concrete: {
    name: 'コンクリート工事',
    defaultUnits: ['m3', '回', 'm3/回'],
    defaultProcesses: [
      {
        name: 'コンクリート打設',
        unit: 'm3',
        defaultUnitPrice: 20000,
        processType: 'concrete',
      },
      {
        name: 'コンクリートポンプ車',
        unit: '回',
        defaultUnitPrice: 50000,
        processType: 'standard',
      },
      {
        name: '生コン',
        unit: 'm3',
        defaultUnitPrice: 15000,
        processType: 'standard',
      },
    ],
  },
  precast: {
    name: 'プレキャストコンクリート工事',
    defaultUnits: ['m3', '個', '式', 't'],
    defaultProcesses: [
      {
        name: 'プレキャスト製品製作',
        unit: 'm3',
        defaultUnitPrice: 45000,
        processType: 'precast',
      },
      {
        name: '製品運搬',
        unit: 't',
        defaultUnitPrice: 15000,
        processType: 'standard',
      },
      {
        name: '製品据付',
        unit: '個',
        defaultUnitPrice: 25000,
        processType: 'standard',
      },
    ],
  },
}

// 作業工程の種類のデータ
const processTypes = {
  standard: {
    name: '標準',
    fields: [
      { id: 'quantity', label: '数量', type: 'number', default: 1 },
      { id: 'unitPrice', label: '単価 (円)', type: 'number', default: 0 },
      { id: 'laborRatio', label: '人工比率', type: 'number', default: 0.1 },
    ],
    calculateAmount: (process) => {
      // 金額の計算
      const amount = process.quantity * process.unitPrice

      // 人工数の自動計算 (数量 × 人工比率)
      process.laborDays = process.quantity * process.laborRatio

      return amount
    },
  },
  area: {
    name: '面積計算',
    fields: [
      { id: 'width', label: '幅 (m)', type: 'number', default: 1 },
      { id: 'height', label: '高さ (m)', type: 'number', default: 1 },
      { id: 'unitPrice', label: '単価 (円/m2)', type: 'number', default: 0 },
      { id: 'laborRatio', label: '人工比率', type: 'number', default: 0.05 },
    ],
    calculateAmount: (process) => {
      const area = process.width * process.height
      process.quantity = area // 数量を計算して設定

      // 人工数の自動計算 (面積 × 人工比率)
      process.laborDays = area * process.laborRatio

      return area * process.unitPrice
    },
  },
  concrete: {
    name: 'コンクリート打設',
    fields: [
      { id: 'volume', label: '打設数量 (m3)', type: 'number', default: 1 },
      { id: 'times', label: '打設回数 (回)', type: 'number', default: 1 },
      { id: 'unitPrice', label: '単価 (円/m3)', type: 'number', default: 0 },
      { id: 'laborRatio', label: '人工比率', type: 'number', default: 0.2 },
    ],
    calculateAmount: (process) => {
      process.averageVolume =
        process.times > 0 ? process.volume / process.times : 0
      process.quantity = process.volume // 数量を打設数量として設定

      // 人工数の自動計算 (体積 × 人工比率 + 打設回数 × 0.5)
      process.laborDays =
        process.volume * process.laborRatio + process.times * 0.5

      return process.volume * process.unitPrice
    },
  },
  precast: {
    name: 'プレキャスト製品',
    fields: [
      { id: 'volume', label: '製品数量 (m3)', type: 'number', default: 1 },
      { id: 'pieces', label: '製品個数 (個)', type: 'number', default: 1 },
      { id: 'unitPrice', label: '単価 (円/m3)', type: 'number', default: 0 },
      {
        id: 'transportDistance',
        label: '運搬距離 (km)',
        type: 'number',
        default: 0,
      },
      { id: 'laborRatio', label: '人工比率', type: 'number', default: 0.15 },
    ],
    calculateAmount: (process) => {
      process.quantity = process.volume // 数量を製品数量として設定
      const baseAmount = process.volume * process.unitPrice
      // 運搬距離に応じた追加費用（1kmあたり1000円）
      const transportCost = process.transportDistance * 1000

      // 人工数の自動計算 (体積 × 人工比率 + 製品個数 × 0.2)
      process.laborDays =
        process.volume * process.laborRatio + process.pieces * 0.2

      return baseAmount + transportCost
    },
  },
}

// DOM要素の取得
document.addEventListener('DOMContentLoaded', function () {
  // ボタン要素
  const addConstructionBtn = document.getElementById('add-construction')
  const savePdfBtn = document.getElementById('save-pdf')
  const saveDataBtn = document.getElementById('save-data')
  const loadDataBtn = document.getElementById('load-data')
  const clearAllBtn = document.getElementById('clear-all')

  // 工事表示エリア
  const constructionList = document.querySelector('.construction-list')
  const constructionProcesses = document.getElementById(
    'construction-processes'
  )

  // 合計表示要素
  const taxRateInput = document.getElementById('tax-rate')
  const miscExpensesInput = document.getElementById('misc-expenses')
  const taxTotalElement = document.getElementById('tax-total')
  const expensesTotalElement = document.getElementById('expenses-total')
  const grandTotalElement = document.getElementById('grand-total')

  // イベントリスナーの設定
  addConstructionBtn.addEventListener('click', addNewConstruction)
  savePdfBtn.addEventListener('click', savePdf)
  saveDataBtn.addEventListener('click', saveData)
  loadDataBtn.addEventListener('click', loadData)
  clearAllBtn.addEventListener('click', clearAll)
  taxRateInput.addEventListener('input', updateTotals)
  miscExpensesInput.addEventListener('input', updateTotals)

  // 初期工事の追加
  addNewConstruction()
})

// 新しい工事を追加する関数
function addNewConstruction() {
  const constructionId = `construction-${constructionCounter++}`

  // データの追加
  constructionsData.push({
    id: constructionId,
    name: `工事 ${constructionCounter}`,
    type: 'general', // デフォルトの工事種類
    processes: [],
    subtotal: 0,
  })

  // テンプレートから工事項目を作成
  const template = document.getElementById('construction-template')
  const constructionItem = template.content
    .cloneNode(true)
    .querySelector('.construction-item')

  // 工事項目の設定
  constructionItem.dataset.id = constructionId
  constructionItem.querySelector(
    '.construction-name'
  ).textContent = `工事 ${constructionCounter}`

  // 工事種類選択の追加
  const typeSelect = constructionItem.querySelector('.construction-type')
  if (typeSelect) {
    // 工事種類の選択肢を設定
    for (const [typeId, typeData] of Object.entries(constructionTypes)) {
      const option = document.createElement('option')
      option.value = typeId
      option.textContent = typeData.name
      typeSelect.appendChild(option)
    }

    // イベントリスナーの設定
    typeSelect.addEventListener('change', function () {
      const constructionIndex = getConstructionIndexById(constructionId)
      if (constructionIndex !== -1) {
        const newType = this.value
        constructionsData[constructionIndex].type = newType

        // 既存の作業工程を削除
        const processesList = constructionItem.querySelector('.processes-list')
        processesList.innerHTML = ''
        constructionsData[constructionIndex].processes = []

        // 新しい工事種類のデフォルト作業工程を追加
        if (
          constructionTypes[newType] &&
          constructionTypes[newType].defaultProcesses
        ) {
          // 最初の作業工程のみを追加
          addNewProcess(
            constructionId,
            constructionTypes[newType].defaultProcesses[0]
          )
        }
      }
    })
  }

  // イベントリスナーの設定
  const toggleBtn = constructionItem.querySelector('.toggle-processes')
  const deleteBtn = constructionItem.querySelector('.delete-construction')
  const addProcessBtn = constructionItem.querySelector('.add-process')
  const processesContainer = constructionItem.querySelector(
    '.processes-container'
  )

  toggleBtn.addEventListener('click', function () {
    if (processesContainer.style.display === 'none') {
      processesContainer.style.display = 'block'
      toggleBtn.textContent = '作業工程を隠す'
    } else {
      processesContainer.style.display = 'none'
      toggleBtn.textContent = '作業工程を表示'
    }
  })

  deleteBtn.addEventListener('click', function () {
    deleteConstruction(constructionId)
  })

  addProcessBtn.addEventListener('click', function () {
    addNewProcess(constructionId)
  })

  // 工事項目を表示エリアに追加
  document
    .getElementById('construction-processes')
    .appendChild(constructionItem)

  // 初期作業工程の追加
  const constructionIndex = getConstructionIndexById(constructionId)
  const constructionType = constructionsData[constructionIndex].type
  if (
    constructionTypes[constructionType] &&
    constructionTypes[constructionType].defaultProcesses
  ) {
    // 最初の作業工程のみを追加
    addNewProcess(
      constructionId,
      constructionTypes[constructionType].defaultProcesses[0]
    )
  } else {
    addNewProcess(constructionId)
  }

  // 工事名を編集可能にする
  const constructionName = constructionItem.querySelector('.construction-name')
  constructionName.contentEditable = true
  constructionName.addEventListener('blur', function () {
    const index = getConstructionIndexById(constructionId)
    if (index !== -1) {
      constructionsData[index].name = this.textContent
      updateSummaryItems()
    }
  })
  constructionName.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      this.blur()
    }
  })
}

// 工事を削除する関数
function deleteConstruction(constructionId) {
  const index = getConstructionIndexById(constructionId)
  if (index !== -1) {
    constructionsData.splice(index, 1)

    // DOMから工事項目を削除
    const constructionItem = document.querySelector(
      `.construction-item[data-id="${constructionId}"]`
    )
    if (constructionItem) {
      constructionItem.remove()
    }

    updateTotals()
    updateSummaryItems()
  }
}

// 新しい作業工程を追加する関数
function addNewProcess(constructionId, defaultProcess = null) {
  const processId = `process-${processCounter++}`
  const constructionIndex = getConstructionIndexById(constructionId)

  if (constructionIndex === -1) return

  const constructionType = constructionsData[constructionIndex].type
  const typeData =
    constructionTypes[constructionType] || constructionTypes.general

  // デフォルト値の設定
  const processName = defaultProcess ? defaultProcess.name : ''
  const processUnit = defaultProcess
    ? defaultProcess.unit
    : typeData.defaultUnits[0] || '回'
  const processUnitPrice = defaultProcess ? defaultProcess.defaultUnitPrice : 0
  const processType = defaultProcess ? defaultProcess.processType : 'standard'

  // 作業工程の種類に基づいて初期データを設定
  const processTypeData = processTypes[processType] || processTypes.standard
  const processData = {
    id: processId,
    name: processName,
    quality: '',
    unit: processUnit,
    unitPrice: processUnitPrice,
    note: '',
    amount: 0,
    processType: processType,
  }

  // 作業工程の種類に応じたフィールドを追加
  processTypeData.fields.forEach((field) => {
    processData[field.id] = field.default
  })

  // 金額を計算
  processData.amount = processTypeData.calculateAmount(processData)

  // データの追加
  constructionsData[constructionIndex].processes.push(processData)

  // テンプレートから作業工程項目を作成
  const template = document.getElementById('process-template')
  const processItem = template.content
    .cloneNode(true)
    .querySelector('.process-item')

  // 作業工程項目の設定
  processItem.dataset.id = processId
  processItem.dataset.type = processType

  // 名前と削除ボタンの設定
  const nameInput = processItem.querySelector('.process-name')
  const deleteBtn = processItem.querySelector('.delete-process')
  nameInput.value = processName

  // 作業工程の種類選択の設定
  const processTypeSelect = processItem.querySelector('.process-type')
  if (processTypeSelect) {
    // 選択肢をクリア
    processTypeSelect.innerHTML = ''

    // 選択肢を追加
    for (const [typeId, typeData] of Object.entries(processTypes)) {
      const option = document.createElement('option')
      option.value = typeId
      option.textContent = typeData.name
      processTypeSelect.appendChild(option)
    }

    // 現在の種類を選択
    processTypeSelect.value = processType

    // イベントリスナーの設定
    processTypeSelect.addEventListener('change', function () {
      const newProcessType = this.value
      updateProcessType(constructionId, processId, newProcessType)
    })
  }

  // 作業工程の詳細フィールドを設定
  const processDetailsContainer = processItem.querySelector('.process-details')
  renderProcessFields(
    processDetailsContainer,
    processData,
    processType,
    constructionId,
    processId
  )

  // 金額表示の設定
  const amountElement = processItem.querySelector('.amount-value')
  amountElement.textContent = processData.amount.toLocaleString()

  // 備考入力の設定
  const noteInput = processItem.querySelector('.process-note')
  if (noteInput) {
    noteInput.value = processData.note || ''
    noteInput.addEventListener('input', function () {
      updateProcessData(constructionId, processId, 'note', this.value)
    })
  }

  // 削除ボタンのイベントリスナー
  deleteBtn.addEventListener('click', function () {
    deleteProcess(constructionId, processId)
  })

  // 名前入力のイベントリスナー
  nameInput.addEventListener('input', function () {
    updateProcessData(constructionId, processId, 'name', this.value)
  })

  // 作業工程項目を工事項目に追加
  const constructionItem = document.querySelector(
    `.construction-item[data-id="${constructionId}"]`
  )
  const processesList = constructionItem.querySelector('.processes-list')
  processesList.appendChild(processItem)

  // 工事の小計を更新
  updateConstructionSubtotal(constructionIndex)
  updateTotals()
}

// 作業工程を削除する関数
function deleteProcess(constructionId, processId) {
  const constructionIndex = getConstructionIndexById(constructionId)
  if (constructionIndex === -1) return

  const processIndex = getProcessIndexById(constructionIndex, processId)
  if (processIndex === -1) return

  // データから作業工程を削除
  constructionsData[constructionIndex].processes.splice(processIndex, 1)

  // DOMから作業工程項目を削除
  const processItem = document.querySelector(
    `.process-item[data-id="${processId}"]`
  )
  if (processItem) {
    processItem.remove()
  }

  // 工事の小計を更新
  updateConstructionSubtotal(constructionIndex)
  updateTotals()
}

// 作業工程データを更新する関数
function updateProcessData(constructionId, processId, field, value) {
  const constructionIndex = getConstructionIndexById(constructionId)
  if (constructionIndex === -1) return

  const processIndex = getProcessIndexById(constructionIndex, processId)
  if (processIndex === -1) return

  // データを更新
  constructionsData[constructionIndex].processes[processIndex][field] = value

  // 金額を計算
  if (field === 'quantity' || field === 'unitPrice') {
    const process = constructionsData[constructionIndex].processes[processIndex]
    process.amount = process.quantity * process.unitPrice

    // 金額表示を更新
    const processItem = document.querySelector(
      `.process-item[data-id="${processId}"]`
    )
    const amountElement = processItem.querySelector('.amount-value')
    amountElement.textContent = process.amount.toLocaleString()

    // 工事の小計を更新
    updateConstructionSubtotal(constructionIndex)
    updateTotals()
  }
}

// 工事の小計を更新する関数
function updateConstructionSubtotal(constructionIndex) {
  const construction = constructionsData[constructionIndex]
  let subtotal = 0

  // 全作業工程の金額を合計
  construction.processes.forEach((process) => {
    subtotal += process.amount
  })

  construction.subtotal = subtotal

  // 小計表示を更新
  const constructionItem = document.querySelector(
    `.construction-item[data-id="${construction.id}"]`
  )
  const subtotalElement = constructionItem.querySelector('.subtotal-amount')
  subtotalElement.textContent = subtotal.toLocaleString()
}

// 合計を更新する関数
function updateTotals() {
  let subtotal = 0
  let totalLaborDays = 0

  // 全工事の小計と人工数を合計
  constructionsData.forEach((construction) => {
    subtotal += construction.subtotal

    // 各作業工程の人工数を合計
    construction.processes.forEach((process) => {
      totalLaborDays += parseFloat(process.laborDays || 0)
    })
  })

  // 消費税と諸経費の計算
  const taxRate = parseFloat(document.getElementById('tax-rate').value) || 0
  const miscExpensesRate =
    parseFloat(document.getElementById('misc-expenses').value) || 0

  const taxAmount = subtotal * (taxRate / 100)
  const expensesAmount = subtotal * (miscExpensesRate / 100)
  const grandTotal = subtotal + taxAmount + expensesAmount

  // 合計表示を更新
  document.getElementById('labor-total').textContent = totalLaborDays.toFixed(1)
  document.getElementById('tax-total').textContent = taxAmount.toLocaleString()
  document.getElementById('expenses-total').textContent =
    expensesAmount.toLocaleString()
  document.getElementById('grand-total').textContent =
    grandTotal.toLocaleString()

  // 工事ごとの小計を更新
  updateSummaryItems()
}

// 工事ごとの小計を表示エリアに更新する関数
function updateSummaryItems() {
  const summaryItemsContainer = document.querySelector('.summary-items')
  summaryItemsContainer.innerHTML = ''

  constructionsData.forEach((construction) => {
    const summaryItem = document.createElement('div')
    summaryItem.className = 'summary-item'
    summaryItem.innerHTML = `
            <span>${construction.name}:</span>
            <span>${construction.subtotal.toLocaleString()} 円</span>
        `
    summaryItemsContainer.appendChild(summaryItem)
  })
}

// IDから工事のインデックスを取得する関数
function getConstructionIndexById(constructionId) {
  return constructionsData.findIndex(
    (construction) => construction.id === constructionId
  )
}

// IDから作業工程のインデックスを取得する関数
function getProcessIndexById(constructionIndex, processId) {
  return constructionsData[constructionIndex].processes.findIndex(
    (process) => process.id === processId
  )
}

// PDFで保存する関数
function savePdf() {
  // jsPDFとhtml2canvasを使用してPDFを生成
  const { jsPDF } = window.jspdf

  // PDFのサイズと向きを設定
  const pdf = new jsPDF('p', 'mm', 'a4')

  // プロジェクト情報の取得
  const projectName =
    document.getElementById('project-name').value || '無題のプロジェクト'
  const clientName =
    document.getElementById('client-name').value || '顧客名なし'
  const projectDate =
    document.getElementById('project-date').value ||
    new Date().toISOString().split('T')[0]

  // PDFのタイトルを設定
  pdf.setFont(undefined, 'bold')
  pdf.setFontSize(16)
  pdf.text('工事見積もり概算', 105, 20, { align: 'center' })

  // プロジェクト情報を追加
  pdf.setFont(undefined, 'normal')
  pdf.setFontSize(12)
  pdf.text(`プロジェクト名: ${projectName}`, 20, 35)
  pdf.text(`顧客名: ${clientName}`, 20, 42)
  pdf.text(`工事予定日: ${projectDate}`, 20, 49)
  pdf.text(`作成日: ${new Date().toLocaleDateString()}`, 20, 56)

  // 区切り線
  pdf.line(20, 60, 190, 60)

  // 工事と作業工程の情報を追加
  let yPos = 70

  constructionsData.forEach((construction, index) => {
    // 新しいページが必要か確認
    if (yPos > 250) {
      pdf.addPage()
      yPos = 20
    }

    // 工事名
    pdf.setFont(undefined, 'bold')
    pdf.text(`${index + 1}. ${construction.name}`, 20, yPos)
    yPos += 7

    // 作業工程
    pdf.setFont(undefined, 'normal')
    pdf.setFontSize(10)

    construction.processes.forEach((process) => {
      // 新しいページが必要か確認
      if (yPos > 270) {
        pdf.addPage()
        yPos = 20
      }

      // 作業工程名と詳細
      pdf.text(`・${process.name || '名称なし'}`, 25, yPos)
      pdf.text(`${process.quality || '-'}`, 80, yPos)
      pdf.text(`${process.quantity} ${process.unit}`, 130, yPos)
      pdf.text(`${process.amount.toLocaleString()} 円`, 170, yPos, {
        align: 'right',
      })

      // 備考があれば追加
      if (process.note) {
        yPos += 5
        pdf.text(`  備考: ${process.note}`, 30, yPos)
      }

      yPos += 7
    })

    // 工事の小計
    pdf.text(`小計: ${construction.subtotal.toLocaleString()} 円`, 170, yPos, {
      align: 'right',
    })
    yPos += 10
  })

  // 新しいページが必要か確認
  if (yPos > 250) {
    pdf.addPage()
    yPos = 20
  }

  // 区切り線
  pdf.line(20, yPos, 190, yPos)
  yPos += 10

  // 合計情報
  pdf.setFontSize(12)

  // 消費税と諸経費の計算
  let subtotal = 0
  let totalLaborDays = 0
  constructionsData.forEach((construction) => {
    subtotal += construction.subtotal
    // 各作業工程の人工数を合計
    construction.processes.forEach((process) => {
      totalLaborDays += parseFloat(process.laborDays || 0)
    })
  })

  const taxRate = parseFloat(document.getElementById('tax-rate').value) || 0
  const miscExpensesRate =
    parseFloat(document.getElementById('misc-expenses').value) || 0

  const taxAmount = subtotal * (taxRate / 100)
  const expensesAmount = subtotal * (miscExpensesRate / 100)
  const grandTotal = subtotal + taxAmount + expensesAmount

  // 合計情報を表示
  pdf.text(`小計: ${subtotal.toLocaleString()} 円`, 170, yPos, {
    align: 'right',
  })
  yPos += 7
  pdf.text(`人工合計: ${totalLaborDays.toFixed(1)} 人日`, 170, yPos, {
    align: 'right',
  })
  yPos += 7
  pdf.text(
    `消費税 (${taxRate}%): ${taxAmount.toLocaleString()} 円`,
    170,
    yPos,
    { align: 'right' }
  )
  yPos += 7
  pdf.text(
    `諸経費 (${miscExpensesRate}%): ${expensesAmount.toLocaleString()} 円`,
    170,
    yPos,
    { align: 'right' }
  )
  yPos += 7

  // 総合計
  pdf.setFont(undefined, 'bold')
  pdf.text(`総合計: ${grandTotal.toLocaleString()} 円`, 170, yPos + 3, {
    align: 'right',
  })

  // PDFを保存
  pdf.save(`${projectName}_見積書.pdf`)
}

// データを保存する関数
function saveData() {
  // プロジェクト情報の取得
  const projectName = document.getElementById('project-name').value
  const clientName = document.getElementById('client-name').value
  const projectDate = document.getElementById('project-date').value
  const taxRate = document.getElementById('tax-rate').value
  const miscExpenses = document.getElementById('misc-expenses').value

  // 保存するデータの作成
  const saveData = {
    projectInfo: {
      name: projectName,
      client: clientName,
      date: projectDate,
    },
    taxRate: taxRate,
    miscExpenses: miscExpenses,
    constructions: constructionsData,
    constructionTypes: constructionTypes, // 工事種類のデータも保存
  }

  // データをJSON形式に変換
  const jsonData = JSON.stringify(saveData)

  // ファイル名の作成
  const fileName = `${projectName || 'construction_estimate'}_${new Date()
    .toISOString()
    .slice(0, 10)}.json`

  // データをダウンロード
  const blob = new Blob([jsonData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// データを読み込む関数
function loadData() {
  // ファイル選択ダイアログを表示
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'

  input.onchange = function (event) {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = function (e) {
      try {
        // JSONデータをパース
        const loadedData = JSON.parse(e.target.result)

        // プロジェクト情報の設定
        if (loadedData.projectInfo) {
          document.getElementById('project-name').value =
            loadedData.projectInfo.name || ''
          document.getElementById('client-name').value =
            loadedData.projectInfo.client || ''
          document.getElementById('project-date').value =
            loadedData.projectInfo.date || ''
        }

        // 税率と諸経費の設定
        if (loadedData.taxRate) {
          document.getElementById('tax-rate').value = loadedData.taxRate
        }
        if (loadedData.miscExpenses) {
          document.getElementById('misc-expenses').value =
            loadedData.miscExpenses
        }

        // 工事種類データの読み込み（オプション）
        if (loadedData.constructionTypes) {
          // 既存のデータと統合
          Object.assign(constructionTypes, loadedData.constructionTypes)
        }

        // 現在のデータをクリア
        clearAll(false)

        // 工事データの読み込み
        if (
          loadedData.constructions &&
          Array.isArray(loadedData.constructions)
        ) {
          constructionsData = loadedData.constructions
          constructionCounter = constructionsData.length

          // 最大のプロセスIDを取得して、カウンターを設定
          let maxProcessId = 0
          constructionsData.forEach((construction) => {
            construction.processes.forEach((process) => {
              const idMatch = process.id.match(/process-(\d+)/)
              if (idMatch && parseInt(idMatch[1]) > maxProcessId) {
                maxProcessId = parseInt(idMatch[1])
              }
            })
          })
          processCounter = maxProcessId + 1

          // 工事項目をDOMに追加
          constructionsData.forEach((construction) => {
            renderConstruction(construction)
          })

          // 合計を更新
          updateTotals()
        }

        alert('データを読み込みました。')
      } catch (error) {
        console.error('データの読み込みに失敗しました:', error)
        alert(
          'データの読み込みに失敗しました。ファイル形式が正しくありません。'
        )
      }
    }
    reader.readAsText(file)
  }

  input.click()
}

// 工事項目をDOMに追加する関数
function renderConstruction(construction) {
  // テンプレートから工事項目を作成
  const template = document.getElementById('construction-template')
  const constructionItem = template.content
    .cloneNode(true)
    .querySelector('.construction-item')

  // 工事項目の設定
  constructionItem.dataset.id = construction.id
  constructionItem.querySelector('.construction-name').textContent =
    construction.name

  // 工事種類選択の設定
  const typeSelect = constructionItem.querySelector('.construction-type')
  if (typeSelect) {
    // 工事種類の選択肢を設定
    for (const [typeId, typeData] of Object.entries(constructionTypes)) {
      const option = document.createElement('option')
      option.value = typeId
      option.textContent = typeData.name
      typeSelect.appendChild(option)
    }

    // 現在の工事種類を選択
    typeSelect.value = construction.type || 'general'

    // イベントリスナーの設定
    typeSelect.addEventListener('change', function () {
      const constructionIndex = getConstructionIndexById(construction.id)
      if (constructionIndex !== -1) {
        const newType = this.value
        constructionsData[constructionIndex].type = newType

        // 既存の作業工程を削除
        const processesList = constructionItem.querySelector('.processes-list')
        processesList.innerHTML = ''
        constructionsData[constructionIndex].processes = []

        // 新しい工事種類のデフォルト作業工程を追加
        if (
          constructionTypes[newType] &&
          constructionTypes[newType].defaultProcesses
        ) {
          // 最初の作業工程のみを追加
          addNewProcess(
            construction.id,
            constructionTypes[newType].defaultProcesses[0]
          )
        }
      }
    })
  }

  // イベントリスナーの設定
  const toggleBtn = constructionItem.querySelector('.toggle-processes')
  const deleteBtn = constructionItem.querySelector('.delete-construction')
  const addProcessBtn = constructionItem.querySelector('.add-process')
  const processesContainer = constructionItem.querySelector(
    '.processes-container'
  )

  toggleBtn.addEventListener('click', function () {
    if (processesContainer.style.display === 'none') {
      processesContainer.style.display = 'block'
      toggleBtn.textContent = '作業工程を隠す'
    } else {
      processesContainer.style.display = 'none'
      toggleBtn.textContent = '作業工程を表示'
    }
  })

  deleteBtn.addEventListener('click', function () {
    deleteConstruction(construction.id)
  })

  addProcessBtn.addEventListener('click', function () {
    addNewProcess(construction.id)
  })

  // 工事名を編集可能にする
  const constructionName = constructionItem.querySelector('.construction-name')
  constructionName.contentEditable = true
  constructionName.addEventListener('blur', function () {
    const index = getConstructionIndexById(construction.id)
    if (index !== -1) {
      constructionsData[index].name = this.textContent
      updateSummaryItems()
    }
  })
  constructionName.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      this.blur()
    }
  })

  // 工事項目を表示エリアに追加
  document
    .getElementById('construction-processes')
    .appendChild(constructionItem)

  // 小計表示を更新
  const subtotalElement = constructionItem.querySelector('.subtotal-amount')
  subtotalElement.textContent = construction.subtotal.toLocaleString()

  // 作業工程を追加
  const processesList = constructionItem.querySelector('.processes-list')
  construction.processes.forEach((process) => {
    renderProcess(construction.id, process, processesList)
  })
}

// 作業工程を削除する関数
function deleteProcess(constructionId, processId) {
  const constructionIndex = getConstructionIndexById(constructionId)
  if (constructionIndex === -1) return

  const processIndex = getProcessIndexById(constructionIndex, processId)
  if (processIndex === -1) return

  // データから作業工程を削除
  constructionsData[constructionIndex].processes.splice(processIndex, 1)

  // DOMから作業工程項目を削除
  const processItem = document.querySelector(
    `.process-item[data-id="${processId}"]`
  )
  if (processItem) {
    processItem.remove()
  }

  // 工事の小計を更新
  updateConstructionSubtotal(constructionIndex)
  updateTotals()
}

// 作業工程の種類を更新する関数
function updateProcessType(constructionId, processId, newProcessType) {
  const constructionIndex = getConstructionIndexById(constructionId)
  if (constructionIndex === -1) return

  const processIndex = getProcessIndexById(constructionIndex, processId)
  if (processIndex === -1) return

  const process = constructionsData[constructionIndex].processes[processIndex]
  const oldProcessType = process.processType

  // 種類が変わらない場合は何もしない
  if (oldProcessType === newProcessType) return

  // 新しい種類を設定
  process.processType = newProcessType

  // 新しい種類に必要なフィールドを追加
  const processTypeData = processTypes[newProcessType] || processTypes.standard
  processTypeData.fields.forEach((field) => {
    if (process[field.id] === undefined) {
      process[field.id] = field.default
    }
  })

  // 金額を再計算
  process.amount = processTypeData.calculateAmount(process)

  // DOMを更新
  const processItem = document.querySelector(
    `.process-item[data-id="${processId}"]`
  )
  if (processItem) {
    processItem.dataset.type = newProcessType

    // 詳細フィールドを更新
    const processDetailsContainer =
      processItem.querySelector('.process-details')
    processDetailsContainer.innerHTML = '' // 既存のフィールドをクリア
    renderProcessFields(
      processDetailsContainer,
      process,
      newProcessType,
      constructionId,
      processId
    )

    // 金額表示を更新
    const amountElement = processItem.querySelector('.amount-value')
    amountElement.textContent = process.amount.toLocaleString()
  }

  // 工事の小計を更新
  updateConstructionSubtotal(constructionIndex)
  updateTotals()
}

// 作業工程の詳細フィールドを描画する関数
function renderProcessFields(
  container,
  process,
  processType,
  constructionId,
  processId
) {
  const processTypeData = processTypes[processType] || processTypes.standard

  // フィールド用のコンテナを作成
  const fieldsContainer = document.createElement('div')
  fieldsContainer.className = 'process-inputs'

  // 各フィールドを追加
  processTypeData.fields.forEach((field) => {
    const fieldGroup = document.createElement('div')
    fieldGroup.className = 'input-group'

    const label = document.createElement('label')
    label.textContent = field.label

    const input = document.createElement('input')
    input.type = field.type
    input.className = `process-${field.id}`
    input.value = process[field.id] || field.default

    if (field.type === 'number') {
      input.min = 0
      input.step = 'any'
    }

    // イベントリスナーの設定
    input.addEventListener('input', function () {
      const value =
        field.type === 'number' ? parseFloat(this.value) || 0 : this.value
      updateProcessField(constructionId, processId, field.id, value)
    })

    fieldGroup.appendChild(label)
    fieldGroup.appendChild(input)
    fieldsContainer.appendChild(fieldGroup)
  })

  // 人工数の表示フィールドを追加
  const laborDaysGroup = document.createElement('div')
  laborDaysGroup.className = 'input-group'

  const laborDaysLabel = document.createElement('label')
  laborDaysLabel.textContent = '人工数 (自動計算)'

  const laborDaysInput = document.createElement('input')
  laborDaysInput.type = 'text'
  laborDaysInput.className = 'process-laborDays'
  laborDaysInput.value = (process.laborDays || 0).toFixed(2)
  laborDaysInput.readOnly = true
  laborDaysInput.style.backgroundColor = '#f0f0f0'

  laborDaysGroup.appendChild(laborDaysLabel)
  laborDaysGroup.appendChild(laborDaysInput)
  fieldsContainer.appendChild(laborDaysGroup)

  // 単位の表示
  const unitGroup = document.createElement('div')
  unitGroup.className = 'input-group'

  const unitLabel = document.createElement('label')
  unitLabel.textContent = '単位:'

  const unitDisplay = document.createElement('div')
  unitDisplay.className = 'unit-display'
  unitDisplay.textContent = process.unit

  unitGroup.appendChild(unitLabel)
  unitGroup.appendChild(unitDisplay)
  fieldsContainer.appendChild(unitGroup)

  // コンテナに追加
  container.appendChild(fieldsContainer)

  // 金額表示を追加
  const amountContainer = document.createElement('div')
  amountContainer.className = 'process-amount'
  amountContainer.innerHTML = `
        <span>金額:</span>
        <span class="amount-value">${process.amount.toLocaleString()}</span> 円
    `
  container.appendChild(amountContainer)

  // 特定の作業工程の種類に応じた追加情報を表示
  if (processType === 'concrete') {
    const averageContainer = document.createElement('div')
    averageContainer.className = 'process-average'
    averageContainer.innerHTML = `
            <span>平均打設数量:</span>
            <span class="average-value">${(process.averageVolume || 0).toFixed(
              2
            )}</span> m3/回
        `
    container.appendChild(averageContainer)
  } else if (processType === 'area') {
    const areaContainer = document.createElement('div')
    areaContainer.className = 'process-area'
    areaContainer.innerHTML = `
            <span>計算面積:</span>
            <span class="area-value">${(process.width * process.height).toFixed(
              2
            )}</span> m2
        `
    container.appendChild(areaContainer)
  }

  // 備考欄を追加
  const notesContainer = document.createElement('div')
  notesContainer.className = 'process-notes'
  const noteInput = document.createElement('input')
  noteInput.type = 'text'
  noteInput.className = 'process-note'
  noteInput.placeholder = '備考 (例: 先送り5% 18.0m3含む)'
  noteInput.value = process.note || ''

  noteInput.addEventListener('input', function () {
    updateProcessData(constructionId, processId, 'note', this.value)
  })

  notesContainer.appendChild(noteInput)
  container.appendChild(notesContainer)
}

// 作業工程のフィールドを更新する関数
function updateProcessField(constructionId, processId, fieldId, value) {
  const constructionIndex = getConstructionIndexById(constructionId)
  if (constructionIndex === -1) return

  const processIndex = getProcessIndexById(constructionIndex, processId)
  if (processIndex === -1) return

  const process = constructionsData[constructionIndex].processes[processIndex]

  // フィールド値を更新
  process[fieldId] = value

  // 作業工程の種類に基づいて金額を再計算
  const processTypeData =
    processTypes[process.processType] || processTypes.standard
  process.amount = processTypeData.calculateAmount(process)

  // DOMを更新
  const processItem = document.querySelector(
    `.process-item[data-id="${processId}"]`
  )
  if (processItem) {
    // 金額表示を更新
    const amountElement = processItem.querySelector('.amount-value')
    amountElement.textContent = process.amount.toLocaleString()

    // 人工数表示を更新
    const laborDaysInput = processItem.querySelector('.process-laborDays')
    if (laborDaysInput) {
      laborDaysInput.value = process.laborDays.toFixed(2)
    }

    // 特定の作業工程の種類に応じた追加情報を更新
    if (process.processType === 'concrete') {
      const averageElement = processItem.querySelector('.average-value')
      if (averageElement) {
        averageElement.textContent = (process.averageVolume || 0).toFixed(2)
      }
    } else if (process.processType === 'area') {
      const areaElement = processItem.querySelector('.area-value')
      if (areaElement) {
        areaElement.textContent = (process.width * process.height).toFixed(2)
      }
    }
  }

  // 工事の小計を更新
  updateConstructionSubtotal(constructionIndex)
  updateTotals()
}

// 作業工程項目をDOMに追加する関数
function renderProcess(constructionId, process, processesList) {
  // テンプレートから作業工程項目を作成
  const template = document.getElementById('process-template')
  const processItem = template.content
    .cloneNode(true)
    .querySelector('.process-item')

  // 作業工程項目の設定
  processItem.dataset.id = process.id
  processItem.dataset.type = process.processType || 'standard'

  // 名前と削除ボタンの設定
  const nameInput = processItem.querySelector('.process-name')
  nameInput.value = process.name || ''

  // 作業工程の種類選択の設定
  const processTypeSelect = processItem.querySelector('.process-type')
  if (processTypeSelect) {
    // 選択肢をクリア
    processTypeSelect.innerHTML = ''

    // 選択肢を追加
    for (const [typeId, typeData] of Object.entries(processTypes)) {
      const option = document.createElement('option')
      option.value = typeId
      option.textContent = typeData.name
      processTypeSelect.appendChild(option)
    }

    // 現在の種類を選択
    processTypeSelect.value = process.processType || 'standard'

    // イベントリスナーの設定
    processTypeSelect.addEventListener('change', function () {
      const newProcessType = this.value
      updateProcessType(constructionId, process.id, newProcessType)
    })
  }

  // 作業工程の詳細フィールドを設定
  const processDetailsContainer = processItem.querySelector('.process-details')
  renderProcessFields(
    processDetailsContainer,
    process,
    process.processType || 'standard',
    constructionId,
    process.id
  )

  // イベントリスナーの設定
  nameInput.addEventListener('input', function () {
    updateProcessData(constructionId, process.id, 'name', this.value)
  })

  const deleteBtn = processItem.querySelector('.delete-process')
  deleteBtn.addEventListener('click', function () {
    deleteProcess(constructionId, process.id)
  })

  // 作業工程項目をリストに追加
  processesList.appendChild(processItem)
}

// すべてクリアする関数
function clearAll(confirm = true) {
  if (confirm && !window.confirm('すべてのデータをクリアしますか？')) {
    return
  }

  // データをクリア
  constructionsData = []
  constructionCounter = 0
  processCounter = 0

  // DOMをクリア
  document.getElementById('construction-processes').innerHTML = ''
  document.querySelector('.summary-items').innerHTML = ''

  // プロジェクト情報をクリア
  document.getElementById('project-name').value = ''
  document.getElementById('client-name').value = ''
  document.getElementById('project-date').value = ''

  // 合計表示をリセット
  document.getElementById('tax-total').textContent = '0'
  document.getElementById('expenses-total').textContent = '0'
  document.getElementById('grand-total').textContent = '0'

  // 初期工事の追加
  if (confirm) {
    addNewConstruction()
  }
}
