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
          "免震上部": 0.55,
          "構台下": 0.82
        },
        "formula": "quantity * locationFactor",
        "laborFormula": "quantity * 0.5 * locationFactor" // 人工計算式を場所係数を考慮したものに修正
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
        "laborFormula": "quantity * 0.3 * locationFactor" // 人工計算式を場所係数を考慮したものに修正
      },
      "小計": {
        "params": {
          "quantity": { "label": "数量", "unit": "" },
          "location": { "label": "場所", "unit": "", "type": "text" }
        },
        "unitPrice": 0,
        "formula": "quantity",
        "laborFormula": "0" // 変更なし
      },
      "値引": {
        "params": {
          "quantity": { "label": "数量", "unit": "式" },
          "location": { "label": "場所", "unit": "", "type": "text" }
        },
        "unitPrice": -89000.0,
        "formula": "quantity",
        "laborFormula": "0" // 変更なし
      }
    },
    "土工": {
      "仮囲組払し手間  11":{
        "params":{"quantity":{"label":"数量","unit":"m"}},
        "unitPrice":0,
        "formula":"quantity",
        "laborFormula": "quantity * 0.05" // 変更なし
      },
      "台風養生手間":{
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
      "スラブ鉄筋養生通路 敷き手間  21":{
        "params":{"quantity":{"label":"数量","unit":"m2"}},
        "unitPrice":0,
        "formula":"quantity",
        "laborFormula": "quantity * 0.01" // 変更なし
      },
      "外部足場下部整地手間":{
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

      if (info.type === 'select' && Array.isArray(info.options)) {
        // セレクトボックスの生成
        const select = document.createElement('select');
        select.id = key;
        select.name = key;
        
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
    addDetailRow();
  });

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
        rowData[k] = info.type === 'text' ? inp.value : (parseFloat(inp.value) || 0);
      }
    }

    // 計算式の評価
    let qtyVal = 0;
    
    // location が存在するときだけ場所係数を適用
    if (taskData.formula === 'quantity * locationFactor' && params.location && rowData.location) {
      let locationFactor = 1;
      if (taskData.locationFactors && taskData.locationFactors[rowData.location]) {
        locationFactor = taskData.locationFactors[rowData.location];
      }
      qtyVal = (rowData.quantity || 0) * locationFactor;
    } else if (taskData.formula === 'quantity') {
      qtyVal = rowData.quantity || 0;
    } else {
      // その他の計算式がある場合はここに追加
      qtyVal = rowData.quantity || 0;
    }
    
    // 人工計算 - マスタの計算式を使用
    let laborVal = 0;
    if (taskData.laborFormula) {
      // 計算式の評価 - 単純な計算式のみ対応
      let formula = taskData.laborFormula;
      
      // quantity を実際の値に置き換え
      formula = formula.replace(/quantity/g, qtyVal);
      
      // locationFactor を実際の値に置き換え（場所係数がある場合）
      if (params.location && rowData.location && taskData.locationFactors) {
        const locationFactor = taskData.locationFactors[rowData.location] || 1;
        formula = formula.replace(/locationFactor/g, locationFactor);
      }
      
      try {
        // evalを使用して計算式を評価（実務では安全な方法を検討すべき）
        laborVal = eval(formula);
      } catch (e) {
        console.error('計算式の評価エラー:', e);
        laborVal = 0;
      }
    }
    
    // 人工から金額を計算
    const costVal = laborVal * DEFAULT_LABOR_UNIT_PRICE;

    // 項目列に表示する値の準備
    let item1 = '';
    let item2 = '';
    let item3 = '';

    // 場所パラメータを項目1に表示
    if (params.location && rowData.location) {
      const label = params.location.label || '場所';
      item1 = `${label}: ${rowData.location}`;
      if (params.location.unit) {
        item1 += ` (${params.location.unit})`;
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
      <td class="labor-cell">${laborVal.toFixed(2)}</td>
      <td class="cost-cell">${costVal.toLocaleString('ja-JP')}</td>
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
