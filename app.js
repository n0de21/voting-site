// DOM
const options     = document.querySelectorAll('.option');
const countsEls   = {
  O1: document.getElementById('resO1'),
  O2: document.getElementById('resO2'),
  O3: document.getElementById('resO3')
};
const commentForm = document.getElementById('comment-form');
const commentInput= document.getElementById('comment');
const submitBtn   = document.getElementById('submit');
const overlay     = document.getElementById('overlay');

let selectedOpt = null;

db.ref('votes').on('value', snap => {
  const data = snap.val() || {O1:0,O2:0,O3:0};
  ['O1','O2','O3'].forEach(k => countsEls[k].textContent = data[k]);
  const max = Math.max(data.O1, data.O2, data.O3);
  options.forEach(opt => {
    opt.classList.toggle(
      'leader',
      data[opt.dataset.opt] === max && max > 0
    );
  });
});

options.forEach(opt => {
  const main = opt.querySelector('.option-main');
  main.addEventListener('click', () => {

    options.forEach(o => {
      o.classList.add('inactive');
      o.classList.remove('selected');
      o.querySelector('.marker').textContent = '○';
    });


    selectedOpt = opt.dataset.opt;
    opt.classList.remove('inactive');
    opt.classList.add('selected');
    opt.querySelector('.marker').textContent = '◉';


    main.after(commentForm);
    commentForm.classList.remove('hidden');
    commentInput.value = '';
    submitBtn.disabled = true;
    commentInput.focus();
  });
});


commentInput.addEventListener('input', () => {
  submitBtn.disabled = !commentInput.value.trim();
});


submitBtn.addEventListener('click', () => {

  if (submitBtn.disabled) return;
  submitBtn.disabled = true;             
  commentInput.disabled = true;          

  const comment = commentInput.value.trim();
  if (!selectedOpt || !comment) return;


  db.ref('votes/' + selectedOpt).transaction(c => (c||0)+1);


  db.ref('votes').once('value')
    .then(snap => {
      const d = snap.val() || {O1:0,O2:0,O3:0};
      return emailjs.send(
        'service_zpg3yeo',   
        'template_cr4709n',  
        {
          counts: `O1=${d.O1}, O2=${d.O2}, O3=${d.O3}`,
          option: selectedOpt,
          comment
        }
      );
    })
    .then(() => {
      overlay.classList.remove('hidden');
      setTimeout(() => location.reload(), 5000);
    })
    .catch(err => {
      console.error('EmailJS error:', err);
      alert('[Letter query timeout... = Try again]');
    });
});
