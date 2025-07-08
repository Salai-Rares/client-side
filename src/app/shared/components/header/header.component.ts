import { Component, Renderer2, OnInit ,ElementRef, ViewChild} from '@angular/core';
import {faStore} from '@fortawesome/free-solid-svg-icons'
import {faSearch} from '@fortawesome/free-solid-svg-icons'
import {faUser} from '@fortawesome/free-solid-svg-icons'
import {faShoppingCart,faHeart} from '@fortawesome/free-solid-svg-icons'
import {
  trigger,
  animate,
  keyframes,
  query,
  stagger,
  transition,
  style,
  state,
  AnimationEvent
} from '@angular/animations'
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations:[
    trigger('toggleNavLinks',[
     
       transition(':enter',[
        style({
          transform:'translateX(100%)'
        }),
        
         animate('0.5s ease-in',style({
          transform:'translateX(0%)'
         })
         
         )]),
         transition(':leave',[
           animate('0.5s ease-in',style({
            transform:'translateX(100%)'
           })
           )]),
    ]),
    trigger('listAnimation',[
      transition('* => *',[
        query(':enter',style({opacity:0}),{optional:true}),
        query(':enter',stagger('300ms',[
          animate('600ms ease-in',keyframes([
            style({opacity : 0 ,offset : 0}),
            style({opacity : 0.5 ,offset : 0.3}),
            style({opacity : 1 ,offset : 1})
          ]))
        ]),{optional:true})
      ])
    ])
  ]
})
export class HeaderComponent implements OnInit {
  //fa icons
  faStore = faStore;
  faSearch= faSearch;
  faUser= faUser;
  faShoppingCart = faShoppingCart;
  faHeart = faHeart;
  
  buttons : {[key:string]:string}[]= [{"Produse":'produse'},{'Categorii de interes':'categorii-de-interes'},{'Promotii':'promotii'},{'% Outlet %':'outlet'},{'Contact':'contact'}];

  hamburgerToggler:boolean = false; 
 
 
  @ViewChild('toggleButton')
  toggleButton?: ElementRef;

  @ViewChild('navLinksMenu')
  navLinksMenu?:ElementRef;

  @ViewChild('line1')
  line1?:ElementRef;

  @ViewChild('line2')
  line2?:ElementRef;

  @ViewChild('line3')
  line3?:ElementRef;


  constructor(private renderer: Renderer2) {
   
   }

  ngOnInit(): void {

    /* to be modfied so when I press on a div from the hamburger menu this 
    function does not interrupt the normal behaviour*/
    this.renderer.listen('window','click',(e:Event)=>{
      if(e.target !== this.toggleButton?.nativeElement && 
        e.target!==this.navLinksMenu?.nativeElement &&
        e.target !== this.line1?.nativeElement &&
        e.target !== this.line2?.nativeElement &&
        e.target !== this.line3?.nativeElement 
        ){
        this.hamburgerToggler=false;
    
      } 
    })
  }

  getTheNameOfKey(key:any){
    return Object.keys(key)[0];
  }

  getTheValueOfKey(key:{[key:string]:string}):string{
   
    return Object.values(key)[0];
  }

  hamburgerTogglerFunction(){
    this.hamburgerToggler=!this.hamburgerToggler;
    console.log('clicked')
  }

  logAnimation(event :AnimationEvent){
    console.log(event.fromState)
  }



}
