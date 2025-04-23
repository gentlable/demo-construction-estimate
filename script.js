// script_embedded.js : auto-generated with full master data
// generated 2025-04-19T01:16:46.218376
document.addEventListener('DOMContentLoaded', () => {

  const masterData = {
    "PC工事": {
      "PC柱": {
        "params": {
          "quantity": { "label": "数量", "unit": "P" },
          "location": { "label": "場所", "unit": "", "type": "select", "options": [
            { "value": "B2F", "label": "B2F" },
            { "value": "B1F", "label": "B1F" },
            { "value": "免震下部", "label": "免震下部" },
            { "value": "免震上部", "label": "免震上部" },
            { "value": "構台下", "label": "構台下" }
          ]}
        },
        "unitPrice": 36300.0,
        "locationFactors": {
          "B2F": 1.0,
          "B1F": 1.0,
          "免震下部": 1.1,
          "免震上部": 0.95,
          "構台下": 0.82
        },
        "formula": "quantity * locationFactor",
        "laborFormula": "quantity * 1.5 * locationFactor" // 人工計算式を場所係数を考慮したものに修正
      },
      "PC仕口": {
        "params": {
          "quantity": { "label": "数量", "unit": "P" },
          "location": { "label": "場所", "unit": "", "type": "select", "options": [
            { "value": "B2F", "label": "B2F" },
            { "value": "B1F", "label": "B1F" }
          ]}
        },
        "unitPrice": 18200.0,
        "locationFactors": {
          "B2F": 1.1,
          "B1F": 1.0
        },
        "formula": "quantity * locationFactor",
        "laborFormula": "quantity * 0.3 * locationFactor"
      },
      "値引": {
        "params": {
          "quantity": { "label": "数量", "unit": "式" },
          "location": { "label": "場所", "unit": "", "type": "text" }
        },
        "unitPrice": -1.0,
        "formula": "quantity",
        "laborFormula": "0" // 変更なし
      }
    },
    "土工": {

      // === ★ 追加: コンクリート打設 ===
      "コンクリート打設": {
        "params": {
          "specification": { "label": "規格", "unit": "m³" },
          "location": { "label": "場所", "unit": "", "type": "select", "options": [
            { "value": "基礎", "label": "基礎" },
            { "value": "地下", "label": "地下" },
            { "value": "地上", "label": "地上" }
          ]},
          "forwardMortar": { "label": "先送りモルタル", "unit": "m³" },
          "quantity": { "label": "数量", "unit": "回" }
        },
        "unitPrice": 0,
        "formula": "quantity",
        // 1日8時間として、1時間に4.25m³を消化できる場合の計算式
        // 人工 = 規格(m³) ÷ 4.25(m³/時間) ÷ 8(時間/日) × 数量(回)
        "laborFormula": "(specification / 4.25 / 8) * quantity"
      },
      "仮囲組払し":{
        "params":{"quantity":{"label":"数量","unit":"m"}},
        "unitPrice":0,
        "formula":"quantity",
        "laborFormula": "quantity * 0.05" // 変更なし
      },
      "台風養生":{
        "params":{"quantity":{"label":"数量","unit":"m2"}},
        "unitPrice":0,
        "formula":"quantity",
        "laborFormula": "quantity * 0.02" // 変更なし
      },
      "足場":{
        "params":{"quantity":{"label":"数量","unit":""}},
        "unitPrice":0,
        "formula":"quantity",
        "laborFormula": "quantity * 0.5" // 変更なし
      },
      "スラブ鉄筋養生通路 敷き":{
        "params":{"quantity":{"label":"数量","unit":"m2"}},
        "unitPrice":0,
        "formula":"quantity",
        "laborFormula": "quantity * 0.01" // 変更なし
      },
      "外部足場下部整地":{
        "params":{"quantity":{"label":"数量","unit":"m2"}},
        "unitPrice":0,
        "formula":"quantity",
        "laborFormula": "quantity * 0.03" // 変更なし
      },
      "外部足場上清掃":{
        "params":{"quantity":{"label":"数量","unit":"m2"}},
        "unitPrice":0,
        "formula":"quantity",
        "laborFormula": "quantity * 0.02" // 変更なし
      },

    }
  };

  // 人工単価のデフォルト値
  const DEFAULT_LABOR_UNIT_PRICE = 25000;

  const constructionSelect = document.getElementById('constructionType');
  const taskSelect = document.getElementById('taskSelect');
  const paramForm = document.getElementById('paramForm');
  const addBtn = document.getElementById('addTaskBtn');
  const taskInputs = document.getElementById('taskInputs');
  const detailTableBody = document.querySelector('#detailTable tbody');
  const estimateArea = document.getElementById('estimateArea');
  const totalQtyEl = document.getElementById('totalQty');
  const totalCostEl = document.getElementById('totalCost');
  const totalLaborEl = document.getElementById('totalLabor');

  populateConstructionTypes();

  function populateConstructionTypes(){
    Object.keys(masterData).forEach(type => {
      const opt = document.createElement('option');
      opt.value = type;
      opt.textContent = type;
      constructionSelect.appendChild(opt);
    });
  }

  constructionSelect.addEventListener('change', () => {
    const type = constructionSelect.value;
    resetTaskArea();
    if(!type) {
      taskInputs.classList.add('hidden');
      return;
    }
    taskInputs.classList.remove('hidden');
    taskSelect.innerHTML = '<option value="">-- 選択してください --</option>';
    Object.keys(masterData[type]).forEach(task => {
      const opt = document.createElement('option');
      opt.value = task;
      opt.textContent = task;
      taskSelect.appendChild(opt);
    });
  });

  taskSelect.addEventListener('change', buildParamInputs);

  function buildParamInputs() {
    paramForm.innerHTML = '';
    addBtn.classList.add('hidden');
    const type = constructionSelect.value;
    const task = taskSelect.value;
    if(!task) return;

    const taskData = masterData[type][task];
    const params = taskData.params || {};

    Object.entries(params).forEach(([key, info]) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'form-group';

      const label = document.createElement('label');
      label.textContent = `${info.label || key} ${info.unit ? '(' + info.unit + ')' : ''}`;
      label.className = 'required';

      if (info.type === 'select' && Array.isArray(info.options)) {
        // セレクトボックスの生成
        const select = document.createElement('select');
        select.id = key;
        select.name = key;
        select.required = true;
        
        // デフォルトの選択肢
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- 選択してください --';
        select.appendChild(defaultOption);
        
        // オプションの追加
        info.options.forEach(option => {
          const opt = document.createElement('option');
          opt.value = option.value;
          opt.textContent = option.label || option.value;
          select.appendChild(opt);
        });
        
        wrapper.appendChild(label);
        wrapper.appendChild(select);
      } else {
        // 通常の入力フィールド
        const input = document.createElement('input');
        input.id = key;
        input.name = key;
        input.required = true;
        if(info.type === 'text') {
          input.type = 'text';
        } else {
          input.type = 'number';
          input.min = 0;
          input.step = 'any';
        }
        
        // デフォルト値があれば設定
        if (info.default !== undefined) {
          input.value = info.default;
        }
        
        wrapper.appendChild(label);
        wrapper.appendChild(input);
      }

      paramForm.appendChild(wrapper);
    });

    addBtn.classList.remove('hidden');
  }

  addBtn.addEventListener('click', e => {
    e.preventDefault();
    
    // 必須チェックを追加
    if (!validateForm()) {
      return;
    }
    
    addDetailRow();
  });

  // 必須入力チェック関数
  function validateForm() {
    const type = constructionSelect.value;
    const task = taskSelect.value;
    
    if (!type) {
      alert('工事種別を選択してください。');
      return false;
    }
    
    if (!task) {
      alert('作業を選択してください。');
      return false;
    }
    
    const taskData = masterData[type][task];
    const params = taskData.params || {};
    
    // パラメータの必須チェック
    for (const [key, info] of Object.entries(params)) {
      const input = document.getElementById(key);
      if (!input) continue;
      
      const value = input.value.trim();
      if (!value) {
        alert(`${info.label || key}を入力してください。`);
        input.focus();
        return false;
      }
      
      // 数値型の場合は有効な数値かチェック
      if (input.type === 'number' && (isNaN(parseFloat(value)) || parseFloat(value) < 0)) {
        alert(`${info.label || key}には有効な数値を入力してください。`);
        input.focus();
        return false;
      }
    }
    
    return true;
  }

  function addDetailRow() {
    const type = constructionSelect.value;
    const task = taskSelect.value;
    const taskData = masterData[type][task];
    const params = taskData.params || {};
    const rowData = {};

    // collect values
    for(const [k, info] of Object.entries(params)) {
      const inp = document.getElementById(k);
      if(!inp) continue;
      
      if (info.type === 'select') {
        rowData[k] = inp.value;
      } else {
        // 数値変換をより確実に行う
        if (info.type === 'text') {
          rowData[k] = inp.value;
        } else {
          // 数値の場合、空文字や変換できない場合は0にする
          const numVal = parseFloat(inp.value);
          rowData[k] = !isNaN(numVal) ? numVal : 0;
        }
      }
    }

    // 計算式の評価
    let qtyVal = 0;
    
    // 数量（quantity）が正しく取得できているか確認
    const quantityValue = rowData.quantity !== undefined ? rowData.quantity : 0;
    console.log("数量値:", quantityValue, "場所:", rowData.location);
    
    // location が存在するときだけ場所係数を適用
    if (taskData.formula === 'quantity * locationFactor' && params.location && rowData.location) {
      let locationFactor = 1;
      if (taskData.locationFactors && taskData.locationFactors[rowData.location]) {
        locationFactor = taskData.locationFactors[rowData.location];
      }
      qtyVal = quantityValue * locationFactor;
      console.log("計算: ", quantityValue, "*", locationFactor, "=", qtyVal);
    } else if (taskData.formula === 'quantity') {
      qtyVal = quantityValue;
    } else {
      // その他の計算式がある場合はここに追加
      qtyVal = quantityValue;
    }
    
    // 人工計算 - マスタの計算式を使用
    let laborVal = 0;
    if (taskData.laborFormula) {
      // 計算式の評価 - 単純な計算式のみ対応
      let formula = taskData.laborFormula;
      
      // パラメータ名をそれぞれの値に置き換え
      for (const [key, value] of Object.entries(rowData)) {
        const regex = new RegExp(key, 'g');
        formula = formula.replace(regex, value);
      }
      
      // 従来の置換処理（既存の置換処理は念のため残す）
      formula = formula.replace(/quantity/g, qtyVal);
      
      // locationFactor を実際の値に置き換え（場所係数がある場合）
      if (params.location && rowData.location && taskData.locationFactors) {
        const locationFactor = taskData.locationFactors[rowData.location] || 1;
        formula = formula.replace(/locationFactor/g, locationFactor);
        
        // 古い計算式互換性のための追加コード
        // B2FFactor, B1FFactor などの変数も locationFactors から設定
        if (rowData.location === 'B2F') {
          formula = formula.replace(/B2FFactor/g, locationFactor);
        } else if (rowData.location === 'B1F') {
          formula = formula.replace(/B1FFactor/g, locationFactor);
        }
      }
      
      try {
        // evalを使用して計算式を評価（実務では安全な方法を検討すべき）
        laborVal = eval(formula);
        // NaNの場合は0に設定
        if (isNaN(laborVal)) {
          console.error('計算結果がNaNです。計算式:', formula);
          laborVal = 0;
        }
      } catch (e) {
        console.error('計算式の評価エラー:', e, '計算式:', formula);
        laborVal = 0;
      }
    }
    
    // 人工から金額を計算
    const costVal = laborVal * DEFAULT_LABOR_UNIT_PRICE;

    // 項目列に表示する値の準備
    let item1 = '';
    let item2 = '';
    let item3 = '';

    // 規格パラメータを項目1に表示
    if (params.specification && rowData.specification) {
      const label = params.specification.label || '規格';
      item1 = `${label}: ${rowData.specification}`;
      if (params.specification.unit) {
        item1 += ` (${params.specification.unit})`;
      }
    }
    
    // 場所パラメータを項目2に表示
    if (params.location && rowData.location) {
      const label = params.location.label || '場所';
      item2 = `${label}: ${rowData.location}`;
      if (params.location.unit) {
        item2 += ` (${params.location.unit})`;
      }
    }
    
    // 先送りモルタルパラメータを項目3に表示
    if (params.forwardMortar && rowData.forwardMortar) {
      const label = params.forwardMortar.label || '先送りモルタル';
      item3 = `${label}: ${rowData.forwardMortar}`;
      if (params.forwardMortar.unit) {
        item3 += ` (${params.forwardMortar.unit})`;
      }
    }

    // 人工計算式は項目に表示しない

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${task}</td>
      <td class="qty-cell">${qtyVal}</td>
      <td>${item1}</td>
      <td>${item2}</td>
      <td>${item3}</td>
      <td class="labor-cell">${Math.floor(laborVal)}</td>
      <td class="cost-cell">${Math.floor(costVal).toLocaleString('ja-JP')}</td>
      <td><button class="remove-btn">削除</button></td>
    `;
    tr.querySelector('.remove-btn').addEventListener('click', () => {
      tr.remove();
      recalcTotals();
    });
    detailTableBody.appendChild(tr);
    estimateArea.classList.remove('hidden');
    recalcTotals();
    paramForm.reset();
  }

  function recalcTotals() {
    let totQty = 0;
    let totLabor = 0;
    let totCost = 0;
    detailTableBody.querySelectorAll('tr').forEach(tr => {
      totQty += parseFloat(tr.querySelector('.qty-cell').textContent) || 0;
      
      const laborCell = tr.querySelector('.labor-cell');
      if (laborCell) {
        totLabor += parseFloat(laborCell.textContent) || 0;
      }
      
      const costStr = tr.querySelector('.cost-cell').textContent.replace(/[,¥]/g, '');
      totCost += parseFloat(costStr) || 0;
    });
    totalQtyEl.textContent = totQty.toFixed(2);
    
    if (totalLaborEl) {
      totalLaborEl.textContent = totLabor.toFixed(2);
    }
    
    totalCostEl.textContent = totCost.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' });
  }

  function resetTaskArea() {
    taskSelect.value = '';
    paramForm.innerHTML = '';
    addBtn.classList.add('hidden');
  }

});
