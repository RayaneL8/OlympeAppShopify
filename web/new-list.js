import { GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "./shopify.js";


let option = ""
let collection = ""

// const GET_PRODUCTS = `
//   query {
//     products(first: 50) {
//       edges {
//         node {
//           id
//           title
//         }
//       }
//     }
//   }
// `;

const GET_PRODUCTSF10 = `
  query {
    products(first: 10) {
      edges {
        node {
          id
          title
        }
      }
    }
  }
`;


const GET_PRODUCTS = (option,collection) => {

const QUERY_PRODUCTS = `
  query {
    collection(id : "`+collection+`") {
      products(first: 15) {
        edges {
          node {
            id
            title
          }
        }
      }
    }  
  }
`;
console.log(QUERY_PRODUCTS);
return QUERY_PRODUCTS;

}

const GET_COLLECTIONS = `
 query{
    collections(first : 100,sortKey : TITLE){
      edges {
        node {
          id
          title
        }
      }
    }
  }
`;

const GET_FIRST_COLLECTION = `
 query{
    collections(first : 1,sortKey : TITLE){
      edges {
        node {
          id
          title
        }
      }
    }
  }
`;

export default async function newList(
  session,
  option,
  collection
) {
  const client = new shopify.api.clients.Graphql({ session});
  let querySelected = ""
  

  try {
    if (option === "TOUT"){
      querySelected  =  GET_PRODUCTS(option,collection);
    }
    else if (option === "10Premiers") {
      querySelected  = GET_PRODUCTS(option,collection);
    }
    else {
      // throw new Error("Option invalide");
      querySelected  = GET_PRODUCTS(option,collection);
    }
    const response = await client.query({
      data: {
        query: querySelected ,
        
      },
    });
    console.log(response)
    return response;  
  } catch (error) {
    if (error instanceof GraphqlQueryError) {
      throw new Error(
        `${error.message}\n${JSON.stringify(error.response, null, 2)}`
      );
    } else {
      throw error;
    }
  }
}


export async function getCollections(
  session
) {
  const client = new shopify.api.clients.Graphql({ session });
  

  try {
    const response = await client.query({
      data: {
        query: GET_COLLECTIONS ,
        
      },
    });
    console.log(response)
    return response;  
  } catch (error) {
    if (error instanceof GraphqlQueryError) {
      throw new Error(
        `${error.message}\n${JSON.stringify(error.response, null, 2)}`
      );
    } else {
      throw error;
    }
  }
}

export async function getFirstCollection(
  session
) {
  const client = new shopify.api.clients.Graphql({ session });
  

  try {
    const response = await client.query({
      data: {
        query: GET_FIRST_COLLECTION ,
        
      },
    });
    console.log(response)
    return response;  
  } catch (error) {
    if (error instanceof GraphqlQueryError) {
      throw new Error(
        `${error.message}\n${JSON.stringify(error.response, null, 2)}`
      );
    } else {
      throw error;
    }
  }
}




