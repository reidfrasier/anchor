/*~
-- ANCHOR TEMPORAL PERSPECTIVES ---------------------------------------------------------------------------------------
--
-- These table valued functions simplify temporal querying by providing a temporal
-- perspective of each anchor. There are five types of perspectives: time traveling, latest,
-- point-in-time, difference, and now. They also denormalize the anchor, its attributes,
-- and referenced knots from sixth to third normal form.
--
-- The time traveling perspective shows information as it was or will be based on a number
-- of input parameters.
--
-- @positor             the view of which positor to adopt
-- @changingTimepoint   the point in changing time to travel to (defaults to End of Time)
-- @positingTimepoint   the point in positing time to travel to (defaults to End of Time)
-- @changingVersion     the version over changing time to show, 1 for current, 2 for previous, ...
-- @positingVersion     the version over positing time to show, 1 for current, 2 for previous, ...
-- @reliable            whether to show reliable (1) or unreliable (2) results
--
-- The latest perspective shows the latest available (changing & positing) information for each anchor.
-- The now perspective shows the information as it is right now, with latest positing time.
-- The point-in-time perspective lets you travel through the information to the given timepoint,
-- with latest positing time and the given point in changing time.
--
-- @changingTimepoint   the point in changing time to travel to
--
-- The difference perspective shows changes between the two given timepoints, and for
-- changes in all or a selection of attributes, with latest positing time.
--
-- @intervalStart       the start of the interval for finding changes
-- @intervalEnd         the end of the interval for finding changes
-- @selection           a list of mnemonics for tracked attributes, ie 'MNE MON ICS', or null for all
--
~*/
var anchor;
while (anchor = schema.nextAnchor()) {
/*~
-- Drop perspectives --------------------------------------------------------------------------------------------------
IF Object_ID('d$anchor.name', 'IF') IS NOT NULL
DROP FUNCTION [$anchor.capsule].[d$anchor.name];
IF Object_ID('n$anchor.name', 'V') IS NOT NULL
DROP VIEW [$anchor.capsule].[n$anchor.name];
IF Object_ID('p$anchor.name', 'IF') IS NOT NULL
DROP FUNCTION [$anchor.capsule].[p$anchor.name];
IF Object_ID('l$anchor.name', 'V') IS NOT NULL
DROP VIEW [$anchor.capsule].[l$anchor.name];
IF Object_ID('t$anchor.name', 'IF') IS NOT NULL
DROP FUNCTION [$anchor.capsule].[t$anchor.name];
GO
~*/
    if(anchor.hasMoreAttributes()) { // only do perspectives if there are attributes
/*~
-- Time traveling perspective -----------------------------------------------------------------------------------------
-- t$anchor.name viewed as given by the input parameters
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$anchor.capsule].[t$anchor.name] (
    @positor $schema.positorRange,
    @changingTimepoint $schema.chronon = $EOT,
    @positingTimepoint $schema.positingRange = $EOT,
    @changingVersion int = 1,
    @positingVersion int = 1,
    @reliable tinyint = 1
)
RETURNS TABLE WITH SCHEMABINDING AS RETURN
SELECT
    [$anchor.mnemonic].$anchor.identityColumnName,
    $(METADATA)? [$anchor.mnemonic].$anchor.metadataColumnName,
~*/
        var knot, attribute;
        while (attribute = anchor.nextAttribute()) {
/*~
    $(IMPROVED)? [$attribute.mnemonic].$attribute.anchorReferenceName,
    $(METADATA)? [$attribute.mnemonic].$attribute.metadataColumnName,
    [$attribute.mnemonic].$attribute.identityColumnName,
    $(attribute.timeRange)? [$attribute.mnemonic].$attribute.changingColumnName,
    [$attribute.mnemonic].$attribute.positingColumnName,
    [$attribute.mnemonic].$attribute.positorColumnName,
    [$attribute.mnemonic].$attribute.reliabilityColumnName,
    [$attribute.mnemonic].$attribute.reliableColumnName,
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    [k$attribute.mnemonic].$knot.valueColumnName AS $attribute.knotValueColumnName,
    $(METADATA)? [k$attribute.mnemonic].$knot.metadataColumnName AS $attribute.knotMetadataColumnName,
~*/
            }
/*~
    [$attribute.mnemonic].$attribute.valueColumnName$(anchor.hasMoreAttributes())?,
~*/
        }
/*~
FROM
    [$anchor.capsule].[$anchor.name] [$anchor.mnemonic]
~*/
        while (attribute = anchor.nextAttribute()) {
/*~
LEFT JOIN
    [$attribute.capsule].[t$attribute.name](
        @positor,
        $(attribute.isHistorized())? @changingTimepoint,
        @positingTimepoint,
        $(attribute.isHistorized())? @changingVersion,
        @positingVersion,
        @reliable
    ) [$attribute.mnemonic]
ON
    [$attribute.mnemonic].$attribute.anchorReferenceName = [$anchor.mnemonic].$anchor.identityColumnName~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
LEFT JOIN
    [$knot.capsule].[$knot.name] [k$attribute.mnemonic]
ON
    [k$attribute.mnemonic].$knot.identityColumnName = [$attribute.mnemonic].$attribute.knotReferenceName~*/
            }
            if(!anchor.hasMoreAttributes()) {
                /*~;~*/
            }
        }
/*~
GO

-- Latest perspective -------------------------------------------------------------------------------------------------
-- l$anchor.name viewed by the latest available information (may include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE VIEW [$anchor.capsule].[l$anchor.name] AS
SELECT
    *
FROM
    [$anchor.capsule].[t$anchor.name] (
        0,
        DEFAULT,
        DEFAULT,
        DEFAULT,
        DEFAULT,
        DEFAULT
    ) [$anchor.mnemonic];
GO
-- Point-in-time perspective ------------------------------------------------------------------------------------------
-- p$anchor.name viewed as it was on the given timepoint
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$anchor.capsule].[p$anchor.name] (
    @changingTimepoint $schema.chronon
)
RETURNS TABLE AS RETURN
SELECT
    *
FROM
    [$anchor.capsule].[t$anchor.name] (
        0,
        @changingTimepoint,
        DEFAULT,
        DEFAULT,
        DEFAULT,
        DEFAULT
    ) [$anchor.mnemonic];
GO
-- Now perspective ----------------------------------------------------------------------------------------------------
-- n$anchor.name viewed as it currently is (cannot include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE VIEW [$anchor.capsule].[n$anchor.name]
AS
SELECT
    *
FROM
    [$anchor.capsule].[t$anchor.name] (
        0,
        $schema.now,
        DEFAULT,
        DEFAULT,
        DEFAULT,
        DEFAULT
    ) [$anchor.mnemonic];
GO
~*/
        if(anchor.hasMoreHistorizedAttributes()) {
/*~
-- Difference perspective ---------------------------------------------------------------------------------------------
-- d$anchor.name showing all differences between the given timepoints and optionally for a subset of attributes
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$anchor.capsule].[d$anchor.name] (
    @intervalStart $schema.chronon,
    @intervalEnd $schema.chronon,
    @selection varchar(max) = null
)
RETURNS TABLE AS RETURN
SELECT
    timepoints.inspectedTimepoint,
    [$anchor.mnemonic].*
FROM (
~*/
            while (attribute = anchor.nextHistorizedAttribute()) {
/*~
    SELECT DISTINCT
        $attribute.changingColumnName AS inspectedTimepoint
    FROM
        [$attribute.capsule].[$attribute.name]
    WHERE
        (@selection is null OR @selection like '%$attribute.mnemonic%')
    AND
        $attribute.changingColumnName BETWEEN @intervalStart AND @intervalEnd
    $(anchor.hasMoreHistorizedAttributes())? UNION
~*/
            }
/*~
) timepoints
CROSS APPLY
    [$anchor.capsule].[t$anchor.name] (
        0,
        timepoints.inspectedTimepoint,
        DEFAULT,
        DEFAULT,
        DEFAULT,
        DEFAULT
    ) [$anchor.mnemonic];
GO
~*/
        }
    }
}