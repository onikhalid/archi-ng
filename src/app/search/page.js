"use client"
import styles from "./search.module.scss"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { where, getDocs, query, collection, orderBy, startt } from "firebase/firestore"
import { db } from "@/utils/firebase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import WhoseandWhichpost from "@/components/Posts/ShowingPosts/Whosepost/whosepost"
import ArticleCard from "@/components/Posts/ShowingPosts/PostCards/Article"
import CaseStudyCard from "@/components/Posts/ShowingPosts/PostCards/Case Study"
import PhotoCard from "@/components/Posts/ShowingPosts/PostCards/Photo"



const Search = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchInput, setSearchInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const searchParameter = searchParams.get('q')
  const categoryParameter = searchParams.get('category')
  const [whichResultType, setwhichResultType] = useState("Studies");
  const [recentSearches, setRecentSearches] = useState([]);




  const handleSearch = async (e) => {
    e.preventDefault();

    if (searchInput === '') {
      toast.error("Don't leave the search bar empty 😅", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 4500,
      });
      return
    }
    router.push(`/search?q=${searchInput}`);
  };




  ///////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  ///////   perform Search once the q parameter in the URL changes
  ///////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    // Add a new search to the list
    const addSearch = (Query) => {
      const updatedSearches = [Query, ...recentSearches.slice(0, 12)];
      setRecentSearches(updatedSearches);
    };


    async function performSearch(queryText) {
      if (queryText == '' || queryText.trim() === '') { return }

      else {

        setSearching(true)
        addSearch(queryText);

        const whichPost = () => {
          if (categoryParameter) {
            if (categoryParameter !== '' && categoryParameter.trim() !== '') {
              setwhichResultType(categoryParameter)
            }
            if (categoryParameter === 'Articles') {
              return 'Articles'
            }
            else if (categoryParameter === 'Studies') {
              return 'Case Studies'
            }

            else if (categoryParameter === 'Photos') {
              return 'Photography'
            }
            else {
              return null
            }

          }

          else if (whichResultType === 'Studies') { return 'Case Studies' }
          else if (whichResultType === 'Articles') { return 'Articles' }
          else if (whichResultType === 'Photos') { return 'Photography' }
          else 'Case Studies'
        }
        if (whichPost() === null) {
          setSearchResult("Wrong Category")
          setSearching(false)
          return
        }

        const postsCollection = collection(db, 'posts');
        const authorQuery = query(postsCollection, where('postType', '==', whichPost()), where('authorName', '>=', queryText), where('authorName', '<=', queryText + '\uf8ff'), orderBy('authorName'));
        const authorResults = await getDocs(authorQuery);

        const titleQuery = query(postsCollection, where('postType', '==', whichPost()), where('title', '>=', queryText), where('title', '<=', queryText + '\uf8ff'));
        const titleResults = await getDocs(titleQuery);

        const tagsQuery = query(postsCollection, where('postType', '==', whichPost()), where('tags', 'array-contains', queryText));
        const tagsResults = await getDocs(tagsQuery);

        const typologyQuery = query(postsCollection, where('postType', '==', whichPost()), where('typology', '>=', queryText), where('typology', '<=', queryText + '\uf8ff'));
        const typologyResults = await getDocs(typologyQuery);

        const architectQuery = query(postsCollection, where('postType', '==', whichPost()), where('architect', '>=', queryText), where('architect', '<=', queryText + '\uf8ff'));
        const architectResults = await getDocs(architectQuery);




        //////////////////////////////////////
        //////   case-insensitive search
        const sentenceCaseQueryText = queryText.charAt(0).toUpperCase() + queryText.slice(1).toLowerCase()
        const lowerCaseQueryText = queryText.toLowerCase()
        const upperCaseQueryText = queryText.toUpperCase()
        const splitText = queryText.split(/[,:.\s-]+/).filter(word => word !== '')
        const splitQueryText = []
        splitText.forEach(text => {
          splitQueryText.push(text, text.toLowerCase(), text.toUpperCase(), text.charAt(0).toUpperCase() + text.slice(1).toLowerCase())
        });
        const caseInsensitiveQueryText = [sentenceCaseQueryText, lowerCaseQueryText, upperCaseQueryText, queryText, ...splitQueryText]

        //CI = caseInsensitive
        const authorCIQuery = query(postsCollection, where('postType', '==', whichPost()), where('authorName', 'in', caseInsensitiveQueryText), orderBy('authorName'));
        const authorCIResults = await getDocs(authorCIQuery);

        const titleCIQuery = query(postsCollection, where('postType', '==', whichPost()), where('title', 'in', caseInsensitiveQueryText), orderBy('title'));
        const titleCIResults = await getDocs(titleCIQuery);

        const tagsCIQuery = query(postsCollection, where('postType', '==', whichPost()), where('tags', 'array-contains', caseInsensitiveQueryText));
        const tagsCIResults = await getDocs(tagsCIQuery);

        const typologyCIQuery = query(postsCollection, where('postType', '==', whichPost()), where('typology', 'in', caseInsensitiveQueryText), orderBy('typology'));
        const typologyCIResults = await getDocs(typologyCIQuery);

        const architectCIQuery = query(postsCollection, where('postType', '==', whichPost()), where('architect', 'in', caseInsensitiveQueryText));
        const architectCIResults = await getDocs(architectCIQuery);

        const locationCIQuery = query(postsCollection, where('postType', '==', whichPost()), where('location', 'array-contains-any', caseInsensitiveQueryText));
        const locationCIResults = await getDocs(locationCIQuery);



        /////////////////////////////////////////////////
        //////   partial match search

        const titlePartialandCIQuery = query(postsCollection, where('postType', '==', whichPost()), where('titleForSearch', 'array-contains', queryText));
        const titlePartialandCIResults = await getDocs(titlePartialandCIQuery);

        /////////////////////////////////////////////////
        //////   partial match + case insensitive search


        const partialandCITitleQuery = query(postsCollection, where('postType', '==', whichPost()), where('titleForSearch', 'array-contains-any', caseInsensitiveQueryText));
        const partialandCITitleResults = await getDocs(partialandCITitleQuery);

        ////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////
        /////////                         RESULTS                     //////////////
        ////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////
        const results = [];
        authorResults.forEach((doc) => results.push(doc.data()));


        authorCIResults.forEach((doc) => { if (!results.find((result) => result.id === doc.id)) { results.push(doc.data()); } });
        titleResults.forEach((doc) => { if (!results.find((result) => result.id === doc.id)) { results.push(doc.data()); } });
        titleCIResults.forEach((doc) => { if (!results.find((result) => result.id === doc.id)) { results.push(doc.data()); } });
        titlePartialandCIResults.forEach((doc) => { if (!results.find((result) => result.id === doc.id)) { results.push(doc.data()); } });
        partialandCITitleResults.forEach((doc) => { if (!results.find((result) => result.id === doc.id)) { results.push(doc.data()); } });

        tagsResults.forEach((doc) => { if (!results.find((result) => result.id === doc.id)) { results.push(doc.data()); } });
        tagsCIResults.forEach((doc) => { if (!results.find((result) => result.id === doc.id)) { results.push(doc.data()); } });
        typologyResults.forEach((doc) => { if (!results.find((result) => result.id === doc.id)) { results.push(doc.data()); } });
        typologyCIResults.forEach((doc) => { if (!results.find((result) => result.id === doc.id)) { results.push(doc.data()); } });
        architectResults.forEach((doc) => { if (!results.find((result) => result.id === doc.id)) { results.push(doc.data()); } });
        architectCIResults.forEach((doc) => { if (!results.find((result) => result.id === doc.id)) { results.push(doc.data()); } });
        locationCIResults.forEach((doc) => { if (!results.find((result) => result.id === doc.id)) { results.push(doc.data()); } });


        setSearchResult(results)
        setSearching(false)
        return;
      }

    }


    if (!(searchParameter === null || '' || searchParameter.trim() === '')) {
      performSearch(searchParameter)
    }

  }, [searchParameter, whichResultType, categoryParameter]);





  /////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////
  ///// handle change UI that show user ehose which results to display/////////
  /////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////
  const resultypevariations = [
    {
      number: 1,
      name: "Studies"
    },
    {
      number: 2,
      name: "Articles",
    },
    {
      number: 3,
      name: "Photos",
    }
  ];





  ///////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////
  /////////////////////      RECENT SEARCHES    /////////////////////////
  ///////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////
  // Load searches from local storage on component mount
  useEffect(() => {
    const savedSearches = localStorage.getItem('searches');
    if (savedSearches !== null) {
      const parsedSearches = JSON.parse(savedSearches);
      setRecentSearches(parsedSearches);
    }
    return () => { }
  }, []);

  ///////////////////////////////////////
  // Save searches to local storage
  useEffect(() => {
    localStorage.setItem('searches', JSON.stringify(recentSearches));
    return () => { }
  }, [recentSearches]);



  // Remove a search from the list
  const removeSearch = (index) => {
    const updatedSearches = [...recentSearches];
    updatedSearches.splice(index, 1);
    setRecentSearches(updatedSearches);
  };



  let pageTitle
  if (searchParameter == null || '') {
    pageTitle = `Search |  Archi NG`
  } else pageTitle = `Search results for "${searchParameter}" |  Archi NG`
















  return (
    <>
      <title>{pageTitle}</title>
      <main className="content-container">

        {/* ///////////////////////////////////////////////////////////// */}
        {/* ///////////////////////////////////////////////////////////// */}
        {/* //////////////       SEARCH BAR      //////////////////////// */}
        {/* ///////////////////////////////////////////////////////////// */}
        {/* ///////////////////////////////////////////////////////////// */}

        {
          searchParameter === null &&
          <div className={styles.searchpage}>
            <header className={styles.header}>
              <h1>Explore</h1>
              <p>Search authors, tags, titles, locations, building typologies... etc</p>
            </header>

            <form className={styles.searchbar} onSubmit={handleSearch}>
              <input
                placeholder="Search..."
                type="search"
                className={styles.searchinput}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button type="submit" >{<FontAwesomeIcon icon={faMagnifyingGlass} />}</button>

            </form>

            <div className={styles.recentcontainer}>
              <h5>RECENT SEARCHES</h5>
              <ul className={styles.recentsearches}>
                {recentSearches.slice(0, 7).map((search, index) => (
                  <li
                    className={styles.recentsearchitem}
                    key={index}

                  >
                    <h6 onClick={() => router.push(`/search?q=${search}`)}
                      title={`search ${search} again`}>{search}</h6>
                    <span title="remove from history" onClick={() => removeSearch(index)}><FontAwesomeIcon icon={faTrashCan} /></span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        }

        {
          searchParameter === '' &&

          <h2>😒 Empty search?</h2>
        }









        {/* ///////////////////////////////////////////////////////////// */}
        {/* ///////////////////////////////////////////////////////////// */}
        {/* //////////////       PERFORM RESULT      //////////////////// */}
        {/* ///////////////////////////////////////////////////////////// */}
        {/* ///////////////////////////////////////////////////////////// */}

        {
          searchParameter !== null &&
          <header className={styles.pageheader}>
            <h1>Search</h1>
            {
              !categoryParameter && <WhoseandWhichpost variations={resultypevariations} currentwhosePost={whichResultType} setCurrentWhosePost={setwhichResultType} />
            }
            {!searching && searchResult && searchResult !== "Wrong Category" && searchResult.length < 1 && <h3>No results for <em>{searchParameter}</em> in {whichResultType}</h3>}
            {!searching && searchResult && searchResult !== "Wrong Category" && searchResult.length > 0 && <h3><em>{searchResult.length}</em> results for <em>{searchParameter}</em> in {whichResultType}</h3>}
          </header>
        }




        {/* ///////////////////////////////////////////////////////////// */}
        {/* ////////////       SEARCHING/LOADING       ////////////////// */}
        {/* ///////////////////////////////////////////////////////////// */}
        {
          searching && <section>
            <h3>Searching...</h3>
          </section>
        }





        {/* ///////////////////////////////////////////////////////////// */}
        {/* ///////////       DISPLAY SEARCH RESULTS       ////////////// */}
        {/* ///////////////////////////////////////////////////////////// */}


        {
          searchResult === "Wrong Category" &&
          <div className="infobox">
            <h3>Check your URL, it has a wrong category, it has to be one of &quot;Articles&quot;, &quot;Studies&apos;, or &quot;Photos&apos; and not <em>{categoryParameter}</em> </h3>
          </div>
        }

          {searchResult &&
        <>
          {!searching && !(searchParameter === null || '') && searchResult !== "Wrong Category" && (
            <section className={styles.resultspage}>
              <div className={styles.resultcontainer}>
                {searchResult.map((result, index) => {

                  if (whichResultType === 'Articles') {
                    return <ArticleCard key={index} post={result} />
                  } else if (whichResultType === 'Studies') {
                    return <CaseStudyCard key={index} post={result} />
                  } else if (whichResultType === 'Photos') {
                    return <PhotoCard key={index} post={result} />
                  }
                })}
              </div>

            </section>
          )}
        </>
        }



      </main>
    </>
  )
}

export default Search 