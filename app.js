
// 默认初始数据
const defaultData = [
    {
        id: 1,
        question: "如何重置我的账户密码？",
        answer: "您可以点击登录页面下方的“忘记密码”链接，输入注册邮箱，我们将发送重置链接给您。请检查垃圾邮件箱以防遗漏。",
        category: "account"
    },
    {
        id: 2,
        question: "支持哪些支付方式？",
        answer: "我们目前支持 Visa、MasterCard、American Express 信用卡，以及 PayPal 和支付宝支付。所有交易均经过 SSL 加密保护。",
        category: "billing"
    },
    {
        id: 3,
        question: "如何取消订阅服务？",
        answer: "登录后进入“设置” > “订阅管理”，点击“取消订阅”按钮即可。取消后，您当前周期的服务仍将保留直到到期日。",
        category: "billing"
    },
    {
        id: 4,
        question: "网站加载缓慢怎么办？",
        answer: "请尝试清除浏览器缓存、禁用广告拦截插件或切换网络环境。如果问题持续，请联系技术支持提供您的浏览器版本信息。",
        category: "technical"
    },
    {
        id: 5,
        question: "如何开启双重验证 (2FA)？",
        answer: "为了账户安全，建议在“安全设置”中开启双重验证。您可以使用 Google Authenticator 或 Authy 等应用扫描二维码进行绑定。",
        category: "account"
    },
    {
        id: 6,
        question: "API 接口有调用限制吗？",
        answer: "是的，基础版用户每分钟限制 60 次请求，专业版用户限制为 1000 次。如需更高额度，请联系企业销售团队。",
        category: "technical"
    }
    {
        id: 7,
        question: "MYSQL 启动不了怎么办？",
        answer: "优先打开 MYSQL 日志查看是否有相关提示，其次检查内存是否足够 MYSQL 程序运行。",
        category: "technical"
    }
];

// 状态管理
let faqData = [];
let currentCategory = 'all';
let searchQuery = '';
let isAdminMode = false;

// DOM 元素
const faqListEl = document.getElementById('faqList');
const searchInput = document.getElementById('searchInput');
const categoryBtns = document.querySelectorAll('.category-btn');
const emptyState = document.getElementById('emptyState');
const adminToggleBtn = document.getElementById('adminToggleBtn');
const adminModal = document.getElementById('adminModal');
const modalBackdrop = document.getElementById('modalBackdrop');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const questionInput = document.getElementById('questionInput');
const answerInput = document.getElementById('answerInput');
const categoryInput = document.getElementById('categoryInput');
const editIdInput = document.getElementById('editId');
const modalTitle = document.getElementById('modalTitle');
const toast = document.getElementById('toast');

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderFAQs();
    setupEventListeners();
});

// 数据加载与保存
function loadData() {
    const stored = localStorage.getItem('faqData');
    if (stored) {
        faqData = JSON.parse(stored);
    } else {
        faqData = [...defaultData];
        saveData();
    }
}

function saveData() {
    localStorage.setItem('faqData', JSON.stringify(faqData));
}

// 渲染逻辑
function renderFAQs() {
    faqListEl.innerHTML = '';
    
    const filtered = faqData.filter(item => {
        const matchesCategory = currentCategory === 'all' || item.category === currentCategory;
        const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.answer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        filtered.forEach(item => {
            const card = createFAQCard(item);
            faqListEl.appendChild(card);
        });
    }
}

function createFAQCard(item) {
    const div = document.createElement('div');
    div.className = `faq-item bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${isAdminMode ? 'relative group' : ''}`;
    
    // 分类标签颜色映射
    const catColors = {
        account: 'bg-blue-100 text-blue-800',
        billing: 'bg-green-100 text-green-800',
        technical: 'bg-purple-100 text-purple-800'
    };
    const catLabel = {
        account: '账户',
        billing: '账单',
        technical: '技术'
    };

    div.innerHTML = `
        <div class="p-6 cursor-pointer" onclick="toggleAnswer(this)">
            <div class="flex justify-between items-start gap-4">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-xs font-semibold px-2.5 py-0.5 rounded ${catColors[item.category] || 'bg-gray-100'}">
                            ${catLabel[item.category] || '其他'}
                        </span>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900 leading-6">${item.question}</h3>
                </div>
                <div class="faq-icon text-indigo-500 mt-1 flex-shrink-0">
                    <i class="fa-solid fa-chevron-down"></i>
                </div>
            </div>
            <div class="faq-answer text-gray-600 leading-relaxed mt-0">
                ${item.answer}
            </div>
        </div>
        ${isAdminMode ? `
        <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 bg-white/90 p-1 rounded-lg shadow-sm backdrop-blur-sm">
            <button onclick="editItem(${item.id}, event)" class="p-2 text-blue-600 hover:bg-blue-50 rounded" title="编辑">
                <i class="fa-solid fa-pen"></i>
            </button>
            <button onclick="deleteItem(${item.id}, event)" class="p-2 text-red-600 hover:bg-red-50 rounded" title="删除">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
        <button onclick="openAddModal()" class="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700" title="添加新项">
             <i class="fa-solid fa-plus"></i>
        </button>
        ` : ''}
    `;
    return div;
}

// 交互功能
window.toggleAnswer = function(element) {
    // 如果点击的是管理按钮，不触发展开
    if (event.target.closest('button')) return;

    const item = element.parentElement;
    const isActive = item.classList.contains('active');
    
    // 关闭其他所有项 (手风琴效果)
    document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('active'));
    
    if (!isActive) {
        item.classList.add('active');
    }
};

// 搜索与筛选
function setupEventListeners() {
    // 搜索输入
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        renderFAQs();
    });

    // 分类点击
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 更新 UI 状态
            categoryBtns.forEach(b => {
                b.classList.remove('bg-indigo-600', 'text-white', 'shadow-md');
                b.classList.add('bg-white', 'text-gray-600', 'border', 'border-gray-200');
            });
            btn.classList.remove('bg-white', 'text-gray-600', 'border', 'border-gray-200');
            btn.classList.add('bg-indigo-600', 'text-white', 'shadow-md');
            
            // 更新逻辑状态
            currentCategory = btn.dataset.category;
            renderFAQs();
        });
    });

    // 管理员模式切换
    adminToggleBtn.addEventListener('click', () => {
        isAdminMode = !isAdminMode;
        adminToggleBtn.innerHTML = isAdminMode ? 
            '<i class="fa-solid fa-unlock mr-1"></i> 退出管理' : 
            '<i class="fa-solid fa-lock mr-1"></i> 管理入口';
        adminToggleBtn.classList.toggle('text-red-600');
        renderFAQs();
        showToast(isAdminMode ? '已进入管理模式' : '已退出管理模式');
    });

    // 模态框控制
    modalBackdrop.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    saveBtn.addEventListener('click', handleSave);
}

// CRUD 操作
window.openAddModal = function() {
    modalTitle.textContent = '添加新问题';
    editIdInput.value = '';
    questionInput.value = '';
    answerInput.value = '';
    categoryInput.value = 'account';
    adminModal.classList.remove('hidden');
};

window.editItem = function(id, event) {
    event.stopPropagation(); // 防止触发展开
    const item = faqData.find(i => i.id === id);
    if (item) {
        modalTitle.textContent = '编辑问题';
        editIdInput.value = item.id;
        questionInput.value = item.question;
        answerInput.value = item.answer;
        categoryInput.value = item.category;
        adminModal.classList.remove('hidden');
    }
};

window.deleteItem = function(id, event) {
    event.stopPropagation();
    if (confirm('确定要删除这条常见问题吗？')) {
        faqData = faqData.filter(i => i.id !== id);
        saveData();
        renderFAQs();
        showToast('删除成功');
    }
};

function closeModal() {
    adminModal.classList.add('hidden');
}

function handleSave() {
    const id = editIdInput.value;
    const question = questionInput.value.trim();
    const answer = answerInput.value.trim();
    const category = categoryInput.value;

    if (!question || !answer) {
        alert('请填写完整的问题和答案');
        return;
    }

    if (id) {
        // 编辑
        const index = faqData.findIndex(i => i.id == id);
        if (index !== -1) {
            faqData[index] = { ...faqData[index], question, answer, category };
            showToast('更新成功');
        }
    } else {
        // 新增
        const newId = Date.now(); // 简单 ID 生成
        faqData.push({ id: newId, question, answer, category });
        showToast('添加成功');
    }

    saveData();
    renderFAQs();
    closeModal();
}

// 工具函数
function showToast(message) {
    const toastEl = document.getElementById('toast');
    const msgEl = document.getElementById('toastMessage');
    msgEl.textContent = message;
    
    toastEl.classList.remove('translate-y-20', 'opacity-0');
    
    setTimeout(() => {
        toastEl.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}
