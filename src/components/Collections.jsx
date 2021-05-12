import { forwardRef } from "react";
import { useCollections } from "../hooks/queries";
import { Select, Spinner } from "@chakra-ui/react";

const Collections = forwardRef(
  ({ onChange, onBlur, name, accounts, isSub = false }, ref) => {
    const { status, data, error } = useCollections(accounts, isSub);

    return (
      <>
        {status === "loading" || status === "idle" ? (
          <>
            <Select
              display="none"
              name={name}
              ref={ref}
              onChange={onChange}
              onBlur={onBlur}
            ></Select>
            <Spinner />
          </>
        ) : status === "error" ? (
          <Select
            placeholder={`Error: ${error.message}`}
            name={name}
            ref={ref}
            onChange={onChange}
            onBlur={onBlur}
          ></Select>
        ) : (
          <Select
            placeholder="Select collection"
            name={name}
            ref={ref}
            onChange={onChange}
            onBlur={onBlur}
          >
            {data.map((collection, index) => (
              <option key={index} value={collection.value}>
                {collection.value}
              </option>
            ))}
          </Select>
        )}
      </>
    );
  }
);

export default Collections;
