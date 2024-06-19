import {Component, OnInit} from '@angular/core';
import {HttpClient,HttpResponse} from "@angular/common/http";
import {update} from "@angular-devkit/build-angular/src/tools/esbuild/angular/compilation/parallel-worker";
import {ProductService} from "../services/product.service";
import {Product} from "../model/product.model";
import {Router} from "@angular/router";
import {AppStateService} from "../services/app-state.service";


@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit{



  constructor(private productService:ProductService,
private router: Router,
              public appState:AppStateService) {
  }

  ngOnInit(): void {
    this.searchProducts();
  }
  searchProducts(){
    /*
    this.appState.setProductState({
      status:"LOADING"
    });*/
    this.productService.searchProducts(
      this.appState.productState.keyword,
      this.appState.productState.currentPage,
      this.appState.productState.pageSize)
      .subscribe({
        next : (resp) => {
          let products=resp.body as Product[];
          let totalProducts:number=parseInt(resp.headers.get('x-total-count')!);
          //this.appState.productState.totalProducts=totalProducts;
          let totalPages=
            Math.floor(totalProducts / this.appState.productState.pageSize);
          if (totalProducts % this.appState.productState.pageSize != 0){
            ++totalPages;
          }
          this.appState.setProductState({
            products :products,
            totalProducts:totalProducts,
            totalPages:totalPages,
            status:"LOADED"

          })
        },
        error : err => {
          this.appState.setProductState({
            status:"ERROR",
            errorMessage:err
          })
        }
      })
  }

  handleCheckedProduct(product: Product) {
    this.productService.checkProduct(product).subscribe({
      next:updatedProduct =>{
        product.checked =! product.checked;
        //this.getProducts();
      }
    })

  }


  handleDelete(product: Product) {
    if(confirm("Etes vous sure?"))
    this.productService.deleteProduct(product).subscribe({
      next:value => {
        //this.getProducts();
        //this.appState.productState.products=
          //this.appState.productState.products.filter((p:any)=>p.id!=product.id)
        this.searchProducts()
      }
    })

  }



  handleGotoPage(page: number) {
    this.appState.productState.currentPage=page;
    this.searchProducts();


  }

  handleEdit(product: Product) {
    this.router.navigateByUrl(`/admin/editProduct/${product.id}`)

  }
}
