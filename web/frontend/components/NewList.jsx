import React, { useState, useEffect } from 'react';
import { Layout, LegacyCard, Button, Text, TextContainer, ResourceList, ResourceItem, TextStyle, Select ,Spinner} from '@shopify/polaris';
import { useAppQuery, useAuthenticatedFetch } from "../hooks";

export function NewList() {
  // const { fetch } = useAppQuery();
  const fetch = useAuthenticatedFetch();
  const [data, setData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [paginatedData, setPaginatedData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [option, setOption] = useState('TOUT');
  const [collection,setCollection] = useState("")
  const [collections,setCollections] = useState([])
  const [isLoading, setIsLoading] = useState(false);
  const [isListGenerated, setIsListGenerated] = useState(false);
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (data) {
      const startIndex = (currentPage - 1) * perPage;
      const endIndex = startIndex + perPage;
      const slicedData = data.slice(startIndex, endIndex);
      setPaginatedData(slicedData);
    }
  }, [data, currentPage, perPage]);

  useEffect(() => {
    if (data) {
      const total = Math.ceil(data.length / perPage);
      setTotalPages(total);
    }
  }, [data, perPage]);

  useEffect(() => {
    getCollections();
  }, []);
  


  const getCollections = async() => {
    setIsLoading(true)
    const response = await fetch(`/api/collections`);
    const tab= [];
    if (response.ok) {
      const responseData = await response.json();
      let isFirstTime = true;
      // const edges = responseData.data.body.data.products.edges;
      let length = responseData.data.body.data.collections.edges.length;
      for(let i = 0;i < length;i++) { 
        if (isFirstTime){
          isFirstTime = false;
          setCollection(responseData.data.body.data.collections.edges[i].node.id);
        }
        const label = responseData.data.body.data.collections.edges[i].node.title;
        const value = responseData.data.body.data.collections.edges[i].node.id;
        tab.push({ label: label.toString(), value: value.toString() });
      }
      setCollections(tab);
      setIsLoading(false)
    }else {
      console.log("Erreur malheureusement");
      setIsLoading(false);
    }
  }

  const newListf = async () => {
    setIsLoading(true);

    const response = await fetch(`/api/products?option=${option}&collection=${collection}`);

    if (response.ok) {
      const responseData = await response.json();
      console.log(responseData)
      const edges = responseData.data.body.data.collection.products.edges;
      setData(edges);
      setCurrentPage(1);
      console.log("C'est bon");
      setIsListGenerated(true);
      setIsLoading(false);
      let formatedCollection = collection.replace("gid://shopify/Collection/", "");
      setTitle("["+option+" | "+formatedCollection+"] Résultat de la Liste" );
    } else {
      console.log("Erreur malheureusement");
      setIsLoading(false);
    }
  };

  const renderItem = (product) => (
    <ResourceItem id={product.node.id}>
      <h3>
        <TextStyle variation="strong">{product.node.title}</TextStyle>
      </h3>
    </ResourceItem>
  );



  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePerPageChange = (value) => {
    setPerPage(parseInt(value, 10));
    setCurrentPage(1);
  };

  const renderPageButtons = () => {
    const pageButtons = [];
    const visiblePages = 2;

    if (currentPage > 1) {
      pageButtons.push(
        <Button key="prev" onClick={() => handlePageChange(currentPage - 1)}>
          Précédent
        </Button>
      );
    }

    const firstVisiblePage = Math.max(1, currentPage - visiblePages);
    const lastVisiblePage = Math.min(totalPages, currentPage + visiblePages);

    if (firstVisiblePage > 1) {
      pageButtons.push(
        <Button key="first" onClick={() => handlePageChange(1)}>
          1
        </Button>
      );

      if (firstVisiblePage > 2) {
        pageButtons.push(<Button key="dots1" disabled>...</Button>);
      }
    }

    for (let i = firstVisiblePage; i <= lastVisiblePage; i++) {
      pageButtons.push(
        <Button
          key={i}
          onClick={() => handlePageChange(i)}
          primary={i === currentPage}
        >
          {i}
        </Button>
      );
    }

    if (lastVisiblePage < totalPages) {
      if (lastVisiblePage < totalPages - 1) {
        pageButtons.push(<Button key="dots2" disabled>...</Button>);
      }

      pageButtons.push(
        <Button key="last" onClick={() => handlePageChange(totalPages)}>
          {totalPages}
        </Button>
      );
    }

    if (currentPage < totalPages) {
      pageButtons.push(
        <Button key="next" onClick={() => handlePageChange(currentPage + 1)}>
          Suivant
        </Button>
      );
    }

    return pageButtons;
  };



  return (
    <Layout>
      <Layout.Section>
        <LegacyCard
          title="Générer une liste"
          sectioned
          primaryFooterAction={{
            content: 'Générer la liste',
            onClick: newListf,
            loading: isLoading,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <TextContainer>
              <Text>Option :</Text>
            </TextContainer>
            <div style={{ marginLeft: '0.5rem' }}>
              <Select
                options={[
                  { label: 'TOUT', value: 'TOUT' },
                  { label: '10Premiers', value: '10Premiers' },
                ]}
                value={option}
                onChange={setOption}
              />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <TextContainer>
              <Text>Collection :</Text>
            </TextContainer>
            <div style={{ marginLeft: '0.5rem' }}>
              <Select
                options={collections}
                value={collection}
                onChange={setCollection}
              />
            </div>
          </div>
        </LegacyCard>
      </Layout.Section>
      <Layout.Section>
        {data && isListGenerated ? (
          <LegacyCard title="Résultat de la liste" sectioned>
            <TextContainer>
            {isListGenerated && ( 
              
              <Text>{title} ({data.length})</Text>
              )}
              <ResourceList
                resourceName={{ singular: 'produit', plural: 'produits' }}
                items={paginatedData}
                renderItem={renderItem}
              />
              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center' }}>
                <TextContainer>
                  <Text>Produits par page:</Text>
                </TextContainer>
                <div style={{ marginLeft: '0.5rem' }}>
                  <Select
                    options={[
                      { label: '5', value: '5' },
                      { label: '10', value: '10' },
                      { label: '20', value: '20' },
                      { label: '50', value: '50' },
                    ]}
                    value={perPage.toString()}
                    onChange={handlePerPageChange}
                  />
                </div>
              </div>
              <div style={{ marginTop: '1rem' }}>
                {renderPageButtons()}
              </div>
            </TextContainer>
          </LegacyCard>
        ) : (
          <LegacyCard sectioned>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {isLoading ? (
                <Spinner size="large" />
              ) : (
                <TextContainer>
                  <Text>Appuyez sur "Générer la liste" pour commencer.</Text>
                </TextContainer>
              )}
            </div>
          </LegacyCard>
        )}
      </Layout.Section>
    </Layout>
  );
}
