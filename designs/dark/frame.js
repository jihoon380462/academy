// Isolated design preview. Never reads or writes the live site's localStorage.
(()=>{'use strict';
  const ui=window.PythonCourseUI,course=window.PYTHON_CH01;
  const state={completed:[],scores:{},last:null};
  const ctx={course,state,storageOK:true};
  const params=new URLSearchParams(location.search);
  const view=['lesson','practice','home'].includes(params.get('view'))?params.get('view'):'lesson';
  const lessonBase='/python/ch01/lesson/';
  const initialRoute=view==='home'?'/subjects/python':lessonBase+'python-l003';
  let initial=true;
  function render(){
    const route=location.hash.slice(1)||initialRoute;
    let html,active='chapter';
    if(route==='/'||route==='/subjects/python'){html=ui.home(ctx);active='home';}
    else if(route==='/python/ch01'){html=ui.chapter(ctx);}
    else if(route==='/python/ch01/review'){html=ui.review(ctx);}
    else if(route==='/progress'){html='<main id="main" class="wrap">'+ui.progress(ctx)+'</main>';active='progress';}
    else{
      const id=route.startsWith(lessonBase)?route.slice(lessonBase.length):'python-l003';
      const lesson=course.lessons.find(l=>l.id===id)||course.lessons[2];
      state.last=lesson.id;html=ui.lesson(lesson,ctx);
    }
    document.getElementById('app').innerHTML=html;
    document.querySelectorAll('[data-nav]').forEach(a=>{a.classList.toggle('active',a.dataset.nav===active);if(a.dataset.nav===active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    document.querySelectorAll('[data-scroll]').forEach(a=>a.onclick=e=>{e.preventDefault();document.getElementById(a.dataset.scroll)?.scrollIntoView({behavior:'instant'});});
    document.querySelectorAll('[data-py-complete]').forEach(b=>b.onclick=()=>{
      const id=b.dataset.pyComplete,index=state.completed.indexOf(id);
      if(index<0)state.completed.push(id);else state.completed.splice(index,1);
      const y=window.scrollY;render();window.scrollTo({top:y,behavior:'instant'});
    });
    document.querySelectorAll('.py-reading-note').forEach(p=>p.classList.add('preview-note'));
    document.querySelectorAll('.py-progress .empty').forEach(p=>{p.textContent='이 시안에서는 읽음 표시의 모양을 확인할 수 있습니다. 실제 학습 기록은 저장되지 않습니다.';});
    window.scrollTo({top:0,behavior:'instant'});
    if(initial&&view==='practice')requestAnimationFrame(()=>document.getElementById('practice')?.scrollIntoView({behavior:'instant'}));
    initial=false;
  }
  document.querySelector('.skip').onclick=e=>{e.preventDefault();const main=document.getElementById('main');main.tabIndex=-1;main.focus();};
  window.addEventListener('hashchange',render);
  render();
})();
