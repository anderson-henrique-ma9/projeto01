import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { CarrinhoComprasService } from "../carrinho-compras.service";
import { FormBuilder, Validators, AbstractControl } from "@angular/forms";
import { FinalizeOrderComponent } from "./finalize-order/finalize-order.component";
import { OrderItem } from "./order.model";
import { Router } from "@angular/router";
import {
  trigger,
  state,
  style,
  animate,
  transition
} from "@angular/animations";

@Component({
  selector: "app-order",
  templateUrl: "./order.component.html",
  styleUrls: ["./order.component.css"],
  animations: [
    trigger("orderComponentState", [
      state(
        "ready",
        style({
          opacity: 1
        })
      ),
      transition(":enter", [style({ opacity: 0 }), animate("300ms 0s ease-in")])
    ])
  ]
})
export class OrderComponent implements OnInit {
  orderComponentState = "ready";

  constructor(
    private carrinhoComprasService: CarrinhoComprasService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  items = this.carrinhoComprasService.items;

  formaPagamento;

  itensPedido: OrderItem[] = [];

  emailPattern = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

  infoPedido = this.fb.group(
    {
      rua: this.fb.control("", [Validators.required, Validators.minLength(5)]),
      numero: this.fb.control("", [
        Validators.required,
        Validators.pattern("^[0-9]*$")
      ]),
      complemento: this.fb.control(""),
      formaPagamento: this.fb.control("", [Validators.required]),
      pedido: this.fb.control(""),
      nome: this.fb.control("", [Validators.required, Validators.minLength(5)]),
      email: this.fb.control("", [
        Validators.required,
        Validators.pattern(this.emailPattern)
      ]),
      confirmaEmail: this.fb.control("", [
        Validators.required,
        Validators.pattern(this.emailPattern)
      ])
    },
    { validator: OrderComponent.equalsTo }
  );

  static equalsTo(infoPedido: AbstractControl): { [key: string]: boolean } {
    const email = infoPedido.get("email");
    const emailConfirmation = infoPedido.get("confirmaEmail");
    if (!email || !emailConfirmation) {
      return undefined;
    }
    if (email.value !== emailConfirmation.value) {
      return { emailsNotMatch: true };
    }
    if (email.value === emailConfirmation.value) {
      return undefined
    }
  }

  get info() {
    return this.infoPedido.controls;
  }

  receberFormaPagamento(codPagamento) {
    this.formaPagamento = codPagamento;
    // console.log(this.formaPagamento);
    this.infoPedido.patchValue({
      formaPagamento: this.formaPagamento
    });
  }
  receberItensPedido(orderItem) {
    this.itensPedido = orderItem;
    // console.log(this.itensPedido);
    this.infoPedido.patchValue({
      pedido: this.itensPedido
    });
    this.carrinhoComprasService
      .enviarPedido(this.infoPedido.value)
      .subscribe(res => {
        if (res) {
          console.log(res);
          this.router.navigate(["/order-summary"]);
          this.carrinhoComprasService.clear();
        }
      });
  }

  ngOnInit() {
    // console.log(this.items);
  }
}
