#!/usr/bin/env python3
import re
import math
from collections import defaultdict, Counter

RAW = r"""
Date	M	T	W	T	F	S	S
01/01/18
To
07/01/18	85	26	95	73	33	19	10
08/01/18
To
14/01/18	41	50	07	41	54	34	48
15/01/18
To
21/01/18	84	49	47	69	35	93	92
22/01/18
To
28/01/18	05	24	95	80	22	38	15
29/01/18
To
04/02/18	77	78	**	03	28	30	14
05/02/18
To
11/02/18	84	91	82	57	30	30	17
12/02/18
To
18/02/18	32	17	20	07	90	15	77
19/02/18
To
25/02/18	72	65	80	81	89	68	56
26/02/18
To
04/03/18	07	58	**	00	68	59	65
05/03/18
To
11/03/18	28	53	12	05	07	78	35
12/03/18
To
18/03/18	76	96	79	81	97	38	52
19/03/18
To
25/03/18	61	45	66	15	45	78	31
26/03/18
To
01/04/18	25	64	20	48	54	**	37
02/04/18
To
08/04/18	84	12	49	18	00	38	32
09/04/18
To
15/04/18	32	49	29	68	56	85	32
16/04/18
To
22/04/18	67	61	93	59	29	23	13
23/04/18
To
29/04/18	82	63	97	25	17	63	39
30/04/18
To
06/05/18	**	47	41	02	04	02	48
07/05/18
To
13/05/18	45	28	07	40	41	03	65
14/05/18
To
20/05/18	77	13	19	31	64	66	30
21/05/18
To
27/05/18	43	60	67	99	78	94	08
28/05/18
To
03/06/18	58	57	57	**	28	38	24
04/06/18
To
10/06/18	11	23	83	71	99	24	99
11/06/18
To
17/06/18	93	61	15	08	20	74	60
18/06/18
To
24/06/18	35	05	69	47	23	04	78
25/06/18
To
01/07/18	44	08	66	32	95	@	50
02/06/18
To
08/07/18	16	10	68	67	95	84	71
09/07/18
To
15/07/18	23	38	26	23	02	42	84
16/07/18
To
22/07/18	31	40	20	49	79	06	69
23/07/18
To
29/07/18	07	35	98	98	13	39	17
30/07/18
To
5/07/18	16	**	26	23	02	42	48
06/08/18
To
12/08/18	31	40	01	67	94	59	87
13/08/18
To
19/08/18	25	14	45	88	66	35	69
20/08/18
To
26/08/18	37	17	24	24	39	06	44
27/08/18
To
02/09/18	27	71	52	69	**	73	56
03/09/18
To
09/09/18	67	90	85	45	51	58	21
10/09/18
To
16/09/18	80	01	14	52	40	59	42
17/09/18
To
23/09/18	08	12	69	60	10	27	25
24/09/18
To
29/09/18	62	17	44	09	00	64	**
01/10/18
To
07/10/18	38	25	30	28	94	97	97
08/10/18
To
14 /10/18	97	53	55	47	48	71	59
15/10/18
To
21 /10/18	16	55	99	81	88	18	35
22/10/18
To
28/10/18	60	07	46	47	32	21	26
29/10/18
To
04/11/18	59	49	**	90	80	36
05/11/18
To
11/11/18	73	26	64	17	28	97	13
12/11/18
To
18/11/18	18	75	15	12	85	23	51
19/11/18
To
25/11/18	44	22	69	11	88	57	49
26/11/18
To
02/12/18	86	69	80	28	**	17	43
03/12/18
To
09/12/18	50	12	67	39	92	54	24
10/12/18
To
18/12/18	03	51	41	40	90	84	50
17/12/18
To
23/12/18	70	16	51	56	76	82	13
24/12/18
To
30/12/18	41	90	06	66	65	80	26
31/12/18
To
06/01/19	**	22	68	81	12	40	67
07/01/19
To
13/01/19	33	54	88	26	63	89	14
14/01/19
To
20/01/19	05	06	61	52	88	76	01
21/01/19
To
27/01/19	55	23	03	25	19	46	04
28/01/19
To
03/02/19	27	19	95	**	51	52	42
04/02/19
To
10/02/19	72	58	16	94	96	12	42
11/02/19
To
17/02/19	83	69	02	01	29	37	23
18/02/19
To
24/02/19	97	22	87	65	49	38	50
25/02/19
To
03/03/19	54	10	36	**	11	03	66
04/03/19
To
10/03/19	75	62	19	29	44	51	89
11/03/19
To
17/03/19	87	77	83	37	73	23	34
18/03/19
To
24/03/19	59	07	18	87	75	05	19
25/03/19
To
31/03/19	31	43	25	85	06	93	**
01/04/19
To
07/04/19	59	58	60	46	27	67	89
08/04/19
To
14/04/19	73	15	29	83	17	05	37
15/04/19
To
21/04/19	64	44	74	55	97	11	75
22/04/19
To
29/04/19	54	70	78	38	34	98	55
29/04/19
To
06/05/19	14	@	13	11	28	08	60
06/05/19
To
13/05/19	20	66	55	04	57	51	71
13/05/19
To
19/05/19	47	80	79	60	81	78	34
20/05/19
To
26/05/19	79	72	51	28	74	99	48
27/05/19
To
02/06/19	59	20	65	23	**	60	02
03/06/19
To
10/06/19	78	51	14	90	27	52	11
10/06/19
To
17/06/19	91	47	44	53	87	95	95
18/06/19
To
24/06/19	97	41	77	90	02	63	40
25/06/19
To
02/07/19	28	81	16	09	40	32	@
01/07/19
To
07/07/19	98	86	29	56	86	01	20
08/07/19
To
14/07/19	56	60	86	58	26	61	67
15/07/19
To
21/07/19	08	30	49	01	03	24	53
22/07/19
To
28/07/19	14	57	01	48	67	28	90
29/07/19
To
04/07/19	89	45	@	18	32	17	47
05/08/19
To
11/08/19	62	14	88	17	51	36	55
12/08/19
To
18/08/19	34	72	28	73	36	95	72
19/08/19
To
25/08/19	63	91	23	98	69	25	11
26/08/19
To
02/08/19	53	66	20	14	72	**	80
02/09/19
To
08/09/19	57	19	88	00	37	65	25
09/09/19
To
15/09/19	50	96	77	65	46	35	05
16/09/19
To
22/09/19	40	62	02	43	41	30	17
23/09/19
To
29/09/19	47	60	67	92	98	08	34
30/10/19
To
6/10/19	**	05	99	77	77	12	87
07/10/19
To
13/10/19	84	57	47	27	54	35	15
14/10/19
To
20/10/19	91	36	19	82	79	78	38
21/10/19
To
27/10/19	15	15	31	17	59	75	03
28/10/19
To
03/11/19	26	46	15	**	07	12	01
04/11/19
To
10/11/19	82	44	50	54	41	16	81
11/11/19
To
17/11/19	46	20	94	02	52	69	97
18/11/19
To
24/11/19	51	29	58	98	76	90	00
25/11/19
To
01/12/19	87	09	37	44	19	**	80
02/12/19
To
08/12/19	66	90	30	09	10	40	36
09/12/19
To
15/12/19	98	44	28	26	03	57	07
16/12/19
To
22/12/19	88	99	94	67	83	58	48
23/12/19
To
29/12/19	58	42	71	13	75	04	94
30/12/19
To
05/01/20	73	**	80	10	94	05	65
06/01/20
To
12/01/20	98	97	48	04	34	58	89
13/01/20
To
19/01/20	99	29	15	11	52	97	20
20/01/20
To
26/01/20	46	03	40	91	90	32	54
27/01/20
To
02/02/20	30	25	51	57	**	77	96
03/02/20
To
09/02/20	18	17	99	32	53	12	30
10/02/20
To
16/02/20	13	80	93	34	40	71	92
17/02/20
To
23/02/20	50	10	27	14	81	61	55
24/02/20
To
01/03/20	29	58	40	09	64	**	53
02/03/20
To
08/03/20	78	71	12	20	81	63	80
09/03/20
To
16/03/20	98	15	86	50	78	27	10
16/03/20
To
22/03/20	23	26	66	03	74	08	01
23/03/20
To
29/03/20	47	22	17	11	24	59	01
30/03/20
To
05/04/20	18	**	49	13	26	65	79
06/04/20
To
12/04/20	73	11	59	78	83	37	72
13/04/20
To
19/04/20	08	77	31	95	92	16	81
20/04/20
To
26/04/20	95	94	55	62	55	00	95
27/04/20
To
03/05/20	05	57	02	**	06	86	00
04/05/20
To
10/05/20	99	49	48	45	22	45	41
11/05/20
To
17/05/20	12	92	46	00	08	41	44
18/05/20
To
24/05/20	79	11	85	13	42	11	56
25/05/20
To
31/05/20	42	00	91	31	58	99	**
01/06/20
To
07/06/20	58	09	19	79	09	32	39
08/06/20
To
14/06/20	03	36	02	61	54	40	60
15/06/20
To
21/06/20	25	52	59	33	31	83	51
22/06/20
To
28/06/20	83	73	02	21	77	69	44
29/06/20
To
05/07/20	39	**	63	72	47	75	18
06/07/20
To
12/07/20	73	21	16	62	91	46	50
13/07/20
To
19/07/20	81	74	63	13	91	65	95
20/07/20
To
26/07/20	28	26	76	77	42	28	20
27/07/20
To
02/08/20	78	71	50	57	**	62	74
03/08/20
To
09/08/20	98	61	73	69	06	75	64
10/08/20
To
16/08/20	65	74	93	72	69	23	36
17/08/20
To
23/08/20	17	49	73	75	05	83	80
24/08/20
To
30/08/20	42	71	69	49	42	42	20
31/08/20
To
06/09/20	**	14	70	29	44	42	02
07/09/20
To
13/09/20	53	46	02	32	16	00	91
14/09/20
To
20/09/20	54	72	98	69	24	49	12
21/09/20
To
27/09/20	64	33	17	31	72	68	38
28/09/20
To
04/10/20	96	27	**	44	00	36	52
05/10/20
To
11/10/20	62	70	08	17	20	75	76
12/10/20
To
18/10/20	97	25	02	87	29	78	31
19/10/20
To
25/10/20	26	59	47	36	32	10	83
19/10/20
To
25/10/20	21	90	86	45	01	**	24
02/11/20
To
08/11/20	12	19	74	81	85	49	58
09/11/20
To
15/11/20	35	54	70	90	13	13	53
16/11/20
To
22/11/20	90	59	63	40	97	89	65
23/11/20
To
29/11/20	47	07	58	84	03	54	74
30/11/20
To
06/12/20	**	05	31	19	89	01	18
07/12/20
To
13/12/20	65	12	98	95	79	79	04
14/12/20
To
20/12/20	77	18	03	53	66	01	25
21/12/20
To
27/12/20	02	72	08	83	73	79	11
28/12/20
To
03/01/20	63	19	89	**	18	84	27
04/01/21
To
10/01/21	82	81	61	47	76	97	49
11/01/21
To
17/01/21	16	86	38	20	24	18	71
18/01/21
To
24/01/21	77	42	29	19	08	94	69
25/01/21
To
31/01/21	38	20	08	49	18	12	**
01/02/21
To
07/02/21	29	94	96	69	76	00	08
08/02/21
To
14/02/21	23	51	42	58	40	29	26
15/02/21
To
21/02/21	58	25	95	52	39	59	86
22/02/21
To
28/02/21	66	10	84	82	68	96	**
01/03/21
To
07/03/21	38	60	46	35	42	19	94
08/03/21
To
14/03/21	24	16	13	91	09	39	51
15/03/21
To
21/03/21	54	11	58	32	50	99	56
22/03/21
To
28/03/21	40	08	95	22	76	69	54
29/03/21
To
04/04/21	59	93	**	36	71	75	90
05/04/21
To
11/04/21	60	52	90	09	20	57	38
12/04/21
To
18/04/21	70	48	35	45	47	94	38
19/04/21
To
25/04/21	11	42	79	81	63	51	48
26/04/21
To
02/05/21	98	33	83	12	**	04	00
03/05/21
To
09/05/21	71	11	50	34	64	07	21
10/05/21
To
16/05/21	35	16	96	02	44	25	42
17/05/21
To
23/05/21	99	38	64	65	84	18	89
24/05/21
To
30/05/21	76	88	84	50	57	38	48
31/05/21
To
06/06/21	**	79	61	23	32	42	88
07/06/21
To
13/06/21	14	99	06	79	72	14	64
14/06/21
To
20/06/21	23	78	64	63	50	78	02
21/06/21
To
27/06/21	40	59	07	97	67	60	49
28/06/21
To
04/07/21	17	64	**	43	80	57	09
05/07/21
To
11/07/21	81	11	30	19	87	53	78
12/07/21
To
18/07/21	11	03	44	33	16	04	10
19/07/21
To
25/07/21	21	94	67	28	10	77	61
26/07/21
To
01/08/21	20	54	49	72	30	**	98
02/08/21
To
08/08/21	85	63	74	59	53	58	16
09/08/21
To
15/08/21	19	72	67	73	32	27	61
16/08/21
To
22/08/21	83	18	59	29	34	30	25
23/08/21
To
29/08/21	25	08	29	85	28	94	71
30/08/21
To
05/09/21	16	**	28	41	88	73	46
06/09/21
To
12/09/21	44	41	00	63	25	04	94
13/09/21
To
19/09/21	14	77	39	79	16	08	87
20/09/21
To
26/09/21	98	98	48	59	85	27	92
27/09/21
To
03/10/21	00	14	49	**	07	90	73
04/10/21
To
10/10/21	26	63	81	71	28	85	86
11/10/21
To
17/10/21	22	30	23	43	18	32	46
18/10/21
To
24/10/21	60	60	86	48	79	50	63
25/10/21
To
31/10/21	51	28	69	81	30	76	**
01/11/21
To
07/11/21	94	44	75	07	85	65	05
08/11/21
To
14/11/21	75	17	93	35	05	71	66
15/11/21
To
21/11/21	22	83	41	88	21	65	72
22/11/21
To
28/11/21	61	14	23	91	04	35	09
29/11/21
To
05/12/21	71	**	19	92	71	24	10
06/12/21
To
12/12/21	28	61	27	33	09	71	79
13/12/21
To
19/12/21	39	27	62	83	92	33	89
20/12/21
To
26/12/21	57	22	57	97	01	88	87
27/12/21
To
02/01/22	69	52	61	59	**	51	54
03/01/22
To
09/01/22	93	88	09	97	04	08	34
10/01/22
To
16/01/22	85	87	38	49	27	04	51
17/01/22
To
23/01/22	20	43	25	75	47	49	34
24/01/22
To
30/01/22	05	46	56	92	52	87	38
31/01/22
To
06/02/22	**	85	33	04	41	13	73
07/02/22
To
13/02/22	54	29	23	70	70	44	97
14/02/22
To
20/02/22	20	26	42	24	42	55	59
21/02/22
To
27/02/22	66	49	62	96	81	66	41
01/03/22
To
06/03/22	**	10	18	58	19	94	57
07/03/22
To
13/03/22	13	55	67	05	68	83	43
14/03/22
To
20/03/22	10	05	34	21	25	34	61
21/03/22
To
27/03/22	35	33	05	41	73	45	39
28/03/22
To
03/04/22	57	11	27	**	64	03	33
04/03/22
To
10/04/22	54	86	61	21	23	28	29
11/04/22
To
17/04/22	38	95	48	39	65	19	38
18/04/22
To
24/04/22	16	46	35	55	49	96	88
25/04/22
To
01/05/22	22	57	05	39	63	**	15
02/05/22
To
08/05/22	13	97	87	20	06	45	02
09/05/22
To
15/05/22	89	60	20	45	03	06	84
16/05/22
To
22/05/22	73	73	24	19	72	10	47
23/05/22
To
29/05/22	53	68	63	16	61	62	87
30/05/22
To
05/06/22	**	71	16	73	27	65	18
05/06/22
to
11/06/22	89	24	88	66	17	82	71
12/06/22
to
18/06/22	55	18	60	78	76	80	29
19/06/22
to
25/06/22	66	53	66	95	22	48	21
26/06/22
to
02/07/22	30	70	56	29	98	51	**
03/07/22
to
09/07/22	25	57	50	28	06	88	49
10/07/22
to
16/07/22	42	17	59	10	84	50	20
17/07/22
to
23/07/22	96	06	93	97	29	01	64
24/07/22
to
30/07/22	77	28	61	38	41	08	**
31/07/22
to
06/08/22	45	21	82	75	20	76	09
08/08/22
to
14/08/22	22	76	53	30	01	77	34
15/08/22
to
21/08/22	44	44	22	21	13	30	13
22/08/22
To
28/08/22	05	09	12	49	03	91	85
29/08/22
To
04/09/22	14	75	**	39	03	19	61
05/09/22
To
11/09/22	51	64	86	38	47	46	00
12/09/22
To
18/09/22	33	66	49	63	43	55	29
19/09/22
To
25/09/22	54	61	12	44	45	17	31
26/09/22
To
02/10/22	68	08	68	67	**	17	89
03/10/22
To
09/10/22	83	00	47	00	15	59	92
10/10/22
To
16/10/22	43	72	20	65	31	07	36
17/10/22
To
23/10/22	02	15	12	72	02	95	66
24/10/22
To
30/10/22	23	00	11	23	17	47	06
31/10/22
To
06/11/22	**	28	38	70	10	11	15
07/11/22
To
13/11/22	69	75	62	96	88	58	12
14/11/22
To
20/11/22	72	76	60	05	18	83	27
21/11/22
To
27/11/22	95	30	63	97	27	15	46
28/11/22
To
04/12/22	61	09	**	85	92	14	68
05/12/22
To
11/12/22	11	27	54	69	71	69	32
12/12/22
To
18/12/22	66	28	53	49	81	80	77
19/12/22
To
25/12/22	60	39	90	10	70	13	53
26/12/22
To
01/01/23	60	15	50	98	19	**	62
02/01/23
To
08/01/23	77	15	60	38	36	00	64
09/01/23
To
15/01/23	36	11	32	55	56	80	20
16/01/23
to
22/01/23	38	74	31	74	14	26	20
23/01/23
to
29/01/23	71	93	34	22	25	14	45
30/01/23
to
05/02/23	11	**	57	90	35	26	69
06/02/23
to
12/02/23	97	02	79	87	28	45	31
13/02/23
to
19/02/23	09	82	16	35	13	37	19
20/02/23
to
26/02/23	56	86	10	41	15	05	83
27/02/23
to
05/03/23	01	**	95	77	63	88	47
06/03/23
to
12/03/23	04	52	83	32	85	88	78
13/03/23
to
19/03/23	70	72	86	58	16	80	85
20/03/23
to
26/03/23	70	30	78	04	02	70	49
27/03/23
to
02/04/23	99	97	69	10	**	28	31
03/04/23
to
09/04/23	27	30	55	37	69	27	26
10/04/23
to
16/04/23	36	76	27	63	06	79	95
17/04/23
to
23/04/23	75	97	94	10	67	97	41
24/04/23
to
30/04/23	16	25	10	21	69	04	**
01/05/23
to
07/05/23	55	85	91	91	94	94	95
08/05/23
to
14/05/23	05	01	30	84	62	90	94
15/05/23
to
21/05/23	53	12	53	53	54	92	75
22/05/23
to
28/05/23	43	92	23	12	41	49	00
29/05/23
to
04/06/23	63	44	**	06	43	84	09
05/06/23
to
11/06/23	51	39	16	22	84	13	39
12/06/23
to
18/06/23	48	56	83	66	48	41	27
19/06/23
to
25/06/23	18	97	36	09	46	36	15
26/06/23
to
02/07/23	85	04	45	59	**	52	21
03/07/23
to
09/07/23	79	09	52	28	10	82	37
10/07/23
to
16/07/23	42	28	75	94	01	72	06
17/07/23
to
23/07/23	60	03	67	71	06	38	81
24/07/23
to
30/07/23	67	37	57	36	17	74	59
31/07/23
to
06/08/23	**	78	04	25	31	90	55
07/08/23
to
13/08/23	98	22	12	00	46	27	24
14/08/23
to
20/08/23	48	97	78	21	55	33	37
21/08/23
to
27/08/23	12	77	02	81	30	34	72
28/08/23
to
03/09/23	98	31	82	**	69	26	16
04/09/23
to
10/09/23	44	47	08	37	45	85	98
11/09/23
to
17/09/23	96	25	93	98	72	70	98
18/09/23
to
24/09/23	25	45	95	81	47	56	80
25/09/23
to
01/10/23	82	93	20	04	11	**	15
02/10/23
to
08/10/23	46	20	52	30	39	42	19
09/10/23
to
15/10/23	33	50	10	08	01	41	34
16/10/23
to
22/10/23	22	21	36	60	04	05	59
23/10/23
to
29/10/23	66	08	12	42	68	49	11
30/10/23
to
05/11/23	36	**	16	06	39	42	50
06/11/23
to
12/11/23	07	43	59	48	86	99	27
13/11/23
to
19/11/23	31	92	56	79	79	71	56
20/11/23
to
26/11/23	10	91	69	25	50	42	20
27/11/23
to
03/12/23	29	60	08	**	93	37	31
04/12/23
to
10/12/23	44	22	89	16	16	73	86
11/12/23
to
17/12/23	60	78	62	42	16	11	24
18/12/23
to
24/12/23	51	20	88	91	06	23	66
25/12/23
to
31/12/23	74	70	58	14	53	88	**
01/01/24
to
07/01/24	86	01	60	26	51	49	20
08/01/24
to
14/01/24	48	56	09	43	16	34	89
15/01/24
to
21/01/24	73	06	78	91	14	99	74
22/01/24
to
28/01/24	53	90	29	22	64	99	13
29/01/24
to
04/02/24	15	48	**	22	16	89	52
05/02/24
to
11/02/24	38	83	99	48	95	68	24
12/02/24
to
18/02/24	83	47	78	52	41	86	29
19/02/24
to
25/02/24	96	56	21	70	67	59	45
26/02/24
to
03/03/24	80	64	85	**	03	36	71
04/03/24
to
10/03/24	39	77	19	95	25	38	49
11/03/24
to
17/03/24	19	05	71	52	74	13	85
18/03/24
to
24/03/24	10	55	43	57	03	74	12
25/03/24
to
31/03/24	93	72	84	85	43	16	**
01/04/24
to
07/04/24	29	57	95	14	00	78	42
08/04/24
to
14/04/24	82	99	96	90	17	37	38
15/04/24
to
21/04/24	45	13	56	59	29	41	88
22/04/24
to
28/04/24	23	75	55	24	58	29	13
29/04/24
to
05/05/24	55	**	48	07	96	02	06
06/05/24
to
12/05/24	56	19	81	49	74	77	13
13/05/24
to
19/05/24	71	45	32	19	08	03	88
20/05/24
to
26/05/24	21	96	96	85	77	26	16
27/05/24
to
02/06/24	51	57	56	96	**	66	93
03/06/24
to
09/06/24	55	64	80	38	40	11	42
10/06/24
to
16/06/24	03	98	23	81	42	10	96
17/06/24
to
23/06/24	98	96	24	19	58	50	46
24/06/24
to
30/06/24	59	40	50	38	52	99	**
01/07/24
to
07/07/24	03	64	70	72	20	63	67
08/07/24
to
14/07/24	05	16	48	46	29	45	09
15/07/24
to
21/07/24	79	47	03	22	53	18	21
22/07/24
to
28/07/24	72	21	25	42	45	10	98
29/07/24
to
04/08/24	33	89	**	47	40	79	33
05/08/24
to
11/08/24	17	54	95	66	33	35	67
12/08/24
to
18/08/24	77	09	05	25	01	70	15
19/08/24
to
25/08/24	07	95	03	70	29	83	86
26/08/24
to
01/09/24	53	17	**	81	77	**	27
02/09/24
to
08/09/24	28	06	85	50	57	11	**
09/09/24
to
15/09/24	29	53	19	60	97	14	28
16/09/24
to
22/09/24	51	03	37	06	49	93	01
23/09/24
to
29/09/24	**	44	44	97	98	08	36
30/09/24
to
06/10/24	**	06	14	75	27	49	62
07/10/24
to
13/10/24	39	19	18	58	34	12	41
14/10/24
to
20/10/24	10	86	90	04	25	60	16
21/10/24
to
27/10/24	34	86	62	90	64	06	57
28/10/24
to
03/11/24	15	90	19	**	82	64	50
04/11/24
to
10/11/24	02	49	**	52	88	58	44
11/11/24
to
17/11/24	86	44	07	37	54	37	52
18/11/24
to
24/11/24	22	09	90	78	59	75	87
25/11/24
to
01/12/24	38	50	82	86	34	**	86
02/12/24
to
08/12/24	94	72	**	77	73	78	47
09/12/24
to
15/12/24	42	47	01	84	83	64	49
16/12/24
to
22/12/24	16	95	24	27	36	44	49
23/12/24
to
29/12/24	96	73	83	60	91	62	28
30/12/24
to
05/01/25	16	**	44	33	67	77	08
06/01/25
to
12/01/25	42	44	30	**	03	91	91
13/01/25
to
19/01/25	93	40	60	96	14	71	43
20/01/25
to
26/01/25	92	76	27	73	20	34	06
27/01/25
to
02/02/25	99	54	58	78	**	93	11
03/02/25
to
09/02/25	57	33	92	35	36	49	53
10/02/25
to
16/02/25	57	71	26	78	40	21	12
17/02/25
to
23/02/25	42	57	98	31	38	32	29
24/02/25
to
02/03/25	90	59	30	95	**	32	36
03/03/25
to
09/03/25	20	35	16	98	79	08	14
10/03/25
to
16/03/25	24	91	32	45	59	27	26
17/03/25
to
23/03/25	69	07	05	73	29	07	01
24/03/25
to
30/03/25	56	56	37	16	39	55	27
31/03/25
to
06/04/25	**	22	90	82	18	76	56
07/04/25
to
13/04/25	60	63	52	22	39	38	58
14/04/25
to
20/04/25	52	77	03	30	34	90	49
21/04/25
to
27/04/25	58	73	98	92	67	16	15
28/04/25
to
04/05/25	50	36	**	09	60	54	88
05/05/25
to
11/05/25	04	72	25	56	79	75	33
12/05/25
to
18/05/25	97	33	72	02	90	88	43
19/05/25
to
25/05/25	30	28	01	63	84	16	32
26/05/25
to
01/06/25	15	16	99	39	19	**	51
02/06/25
to
08/06/25	17	06	47	47	03	05	06
09/06/25
to
15/06/25	69	59	62	05	04	13	82
16/06/25
to
22/06/25	93	13	36	62	23	80	34
30/06/25
to
06/07/25	**	45	56	72	63	56	17
07/07/25
to
13/07/25	83	41	42	14	88	25	86
14/07/25
to
20/07/25	11	49	78	99	68	17	09
21/07/25
to
27/07/25	69	51	02	46	32	37	02
28/07/25
to
03/08/25	92	68	04	**	88	89	46
04/08/25
to
10/08/25	16	28	98	38	97	89	34
11/08/25
to
17/08/25	98	18	81	73	17	92	16
18/08/25
to
24/08/25	82	02	**	44	07	15	69
25/08/25
to
31/08/25	18	95	51	11	96	09	**
01/09/25
to
07/09/25	64	75	49	**	76	94	41
08/09/25
to
14/09/25	75
"""


WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


def tokenize_values(raw_text: str):
    tokens = []
    for m in re.finditer(r"\*\*|@|\b\d{2}\b", raw_text):
        s, e = m.start(), m.end()
        before = raw_text[s - 1] if s - 1 >= 0 else "\n"
        after = raw_text[e] if e < len(raw_text) else "\n"
        if before == "/" or after == "/":
            # inside a date token like 30/10/19 -> skip
            continue
        token = m.group(0)
        tokens.append(token)
    # Convert to ints / None
    values = []
    for t in tokens:
        if t == "**" or t == "@":
            values.append(None)
        else:
            values.append(int(t))
    return values


def group_weeks(values):
    weeks = []
    current = []
    for v in values:
        current.append(v)
        if len(current) == 7:
            weeks.append(current)
            current = []
    # Return leftover as well (incomplete last week)
    return weeks, current


def compute_basic_stats(weeks):
    overall_counter = Counter()
    weekday_counter = [Counter() for _ in range(7)]
    last_digit_counter = Counter()
    tens_digit_counter = Counter()
    sum_digits_counter = Counter()
    odd_even_counter = Counter()  # keys: 'odd','even'
    prime_counter = Counter()  # keys: 'prime','nonprime'

    primes = set()
    def is_prime(n: int) -> bool:
        if n < 2:
            return False
        if n % 2 == 0:
            return n == 2
        r = int(math.sqrt(n))
        for x in range(3, r + 1, 2):
            if n % x == 0:
                return False
        return True
    for p in range(0, 100):
        if is_prime(p):
            primes.add(p)

    for w in weeks:
        for d, v in enumerate(w):
            if v is None:
                continue
            overall_counter[v] += 1
            weekday_counter[d][v] += 1
            last_digit_counter[v % 10] += 1
            tens_digit_counter[v // 10] += 1
            sum_digits_counter[(v // 10) + (v % 10)] += 1
            if v % 2 == 0:
                odd_even_counter["even"] += 1
            else:
                odd_even_counter["odd"] += 1
            prime_counter["prime" if v in primes else "nonprime"] += 1

    return {
        "overall_counter": overall_counter,
        "weekday_counter": weekday_counter,
        "last_digit_counter": last_digit_counter,
        "tens_digit_counter": tens_digit_counter,
        "sum_digits_counter": sum_digits_counter,
        "odd_even_counter": odd_even_counter,
        "prime_counter": prime_counter,
    }


def compute_gap_stats(weeks):
    # day-wise linear series ignoring None
    last_seen_day = {n: None for n in range(100)}
    gaps = defaultdict(list)
    day_index = 0
    for w in weeks:
        for v in w:
            if v is None:
                # Still advance the day index to count calendar days
                day_index += 1
                continue
            prev = last_seen_day[v]
            if prev is not None:
                gaps[v].append(day_index - prev)
            last_seen_day[v] = day_index
            day_index += 1
    # Summaries
    gap_summary = {}
    for n in range(100):
        if gaps[n]:
            gap_summary[n] = {
                "count": len(gaps[n]),
                "avg_gap": sum(gaps[n]) / len(gaps[n]),
                "min_gap": min(gaps[n]),
                "max_gap": max(gaps[n]),
            }
    return gap_summary


def compute_transitions(weeks):
    # Adjacent day transitions (across total linearized days)
    linear = []
    for w in weeks:
        linear.extend(w)
    adj_counts = defaultdict(Counter)  # v -> next_v
    last_digit_adj = defaultdict(Counter)  # d -> next_d
    for i in range(len(linear) - 1):
        a, b = linear[i], linear[i + 1]
        if a is None or b is None:
            continue
        adj_counts[a][b] += 1
        last_digit_adj[a % 10][b % 10] += 1

    # Same weekday transitions (lag-7)
    same_weekday_counts = [defaultdict(Counter) for _ in range(7)]  # [weekday][v][next_v]
    for d in range(7):
        prev = None
        for w in range(len(weeks) - 1):
            v = weeks[w][d]
            nv = weeks[w + 1][d]
            if v is None or nv is None:
                continue
            same_weekday_counts[d][v][nv] += 1

    return adj_counts, last_digit_adj, same_weekday_counts


def compute_cycles(linear_values):
    # measure correlation at lags 7, 30 for last digits and raw modulo 10/9
    seq = [v for v in linear_values if v is not None]
    if len(seq) < 50:
        return {}
    def corr_at_lag(arr, lag):
        a = arr[:-lag]
        b = arr[lag:]
        n = len(a)
        if n == 0:
            return 0.0
        mean_a = sum(a) / n
        mean_b = sum(b) / n
        num = sum((a[i] - mean_a) * (b[i] - mean_b) for i in range(n))
        den_a = math.sqrt(sum((x - mean_a) ** 2 for x in a))
        den_b = math.sqrt(sum((y - mean_b) ** 2 for y in b))
        if den_a == 0 or den_b == 0:
            return 0.0
        return num / (den_a * den_b)

    last_digits = [v % 10 for v in seq]
    mod9 = [v % 9 for v in seq]
    res = {
        "corr_last_digit_lag7": corr_at_lag(last_digits, 7) if len(last_digits) > 7 else 0.0,
        "corr_last_digit_lag30": corr_at_lag(last_digits, 30) if len(last_digits) > 30 else 0.0,
        "corr_value_lag7": corr_at_lag(seq, 7) if len(seq) > 7 else 0.0,
        "corr_mod9_lag9": corr_at_lag(mod9, 9) if len(mod9) > 9 else 0.0,
    }
    return res


def normalize_counter(counter: Counter):
    total = sum(counter.values())
    if total == 0:
        return {}
    return {k: counter[k] / total for k in counter}


def predict_next_week(weeks, same_weekday_counts, adj_counts, last_digit_adj, leftover):
    # Determine which days are missing in the last week
    last_week = weeks[-1] if weeks else []
    # If leftover exists (incomplete last week not included in weeks), build current_week with leftover
    if leftover:
        last_week = leftover + [None] * (7 - len(leftover))

    # Find index of first None after existing values
    start_day = 0
    for i in range(7):
        if last_week[i] is None:
            start_day = i
            break
    # Build predictions per day i from start_day..6
    predictions = {}
    # For context, use the last observed value for the same weekday from previous weeks, i.e., current value at day i in last_week
    for d in range(start_day, 7):
        # Build candidate scores for numbers 0..99
        scores = Counter()
        # Weight 1: same-weekday transition from last observed value at this weekday in the previous (complete) week
        prev_week_index = len(weeks) - 1
        prev_val = None
        # If leftover provided, the previous full week is weeks[-1]
        if leftover:
            if weeks:
                prev_val = weeks[-1][d]
        else:
            if len(weeks) >= 2:
                prev_val = weeks[-2][d]
            else:
                prev_val = None

        if prev_val is not None:
            trans = same_weekday_counts[d].get(prev_val, Counter())
            total = sum(trans.values())
            for k, v in trans.items():
                scores[k] += 0.6 * (v / total if total else 0)

        # Weight 2: adjacency from last observed previous day in current week (d-1)
        if d > 0:
            left_val = last_week[d - 1]
            if left_val is not None:
                trans2 = adj_counts.get(left_val, Counter())
                total2 = sum(trans2.values())
                for k, v in trans2.items():
                    scores[k] += 0.25 * (v / total2 if total2 else 0)
            else:
                # Backoff to last-digit adjacency if left is None
                pass

        # Weight 3: last-digit adjacency using prev weekday value
        if prev_val is not None:
            ld = prev_val % 10
            ld_trans = last_digit_adj.get(ld, Counter())
            total3 = sum(ld_trans.values())
            for k, v in ld_trans.items():
                # distribute last-digit prob over all numbers with that last digit proportionally to overall freq later
                scores[(ld, k)] += 0.15 * (v / total3 if total3 else 0)

        # Convert last-digit tuple hints into number-level scores using overall popularity at that last digit
        # We need overall frequency to distribute
        # We'll compute after this loop; for now, keep tuples
        predictions[d] = scores

    return predictions, last_week


def distribute_last_digit_hints(scores, overall_counter):
    # Convert any (ld_from, ld_to) keys into number scores distributed by overall frequency among numbers with that last digit
    converted = Counter()
    pending_ld = []
    for k, v in scores.items():
        if isinstance(k, tuple):
            pending_ld.append((k, v))
        else:
            converted[k] += v
    # Precompute popularity for each last digit
    ld_to_numbers = {d: [] for d in range(10)}
    for n, c in overall_counter.items():
        ld_to_numbers[n % 10].append((n, c))
    for d in range(10):
        ld_to_numbers[d].sort(key=lambda x: x[1], reverse=True)
        total_c = sum(c for _, c in ld_to_numbers[d])
        if total_c == 0:
            total_c = 1
        ld_to_numbers[d] = [(n, c / total_c) for n, c in ld_to_numbers[d]]
    for (ld_from, ld_to), weight in pending_ld:
        distribution = ld_to_numbers.get(ld_to, [])
        for n, frac in distribution:
            converted[n] += weight * frac
    return converted


def format_counter_top(counter, topn=10, as_int_keys=True):
    items = counter.most_common()
    lines = ["rank | key | count", "---: | --- | ---:"]
    for i, (k, v) in enumerate(items[:topn], 1):
        key = int(k) if (as_int_keys and isinstance(k, (int, float))) else str(k)
        lines.append(f"{i} | {key} | {v}")
    return "\n".join(lines)


def main():
    values = tokenize_values(RAW)
    weeks, leftover = group_weeks(values)

    stats = compute_basic_stats(weeks)
    gap_summary = compute_gap_stats(weeks)
    adj_counts, last_digit_adj, same_weekday_counts = compute_transitions(weeks)
    linear = []
    for w in weeks:
        linear.extend(w)
    cycles = compute_cycles(linear)

    # Build predictions for the incomplete last window (the final chunk has only Monday=75)
    preds_raw, last_week = predict_next_week(weeks, same_weekday_counts, adj_counts, last_digit_adj, leftover)

    # Finalize predictions with last-digit hint distribution and global popularity backoff
    overall_counter = stats["overall_counter"]
    results = {}
    for d, sc in preds_raw.items():
        sc2 = distribute_last_digit_hints(sc, overall_counter)
        # Backoff prior: global popularity
        total_overall = sum(overall_counter.values()) or 1
        for n, c in overall_counter.items():
            sc2[n] += 0.05 * (c / total_overall)
        # Normalize
        total = sum(sc2.values()) or 1.0
        probs = [(n, sc2[n] / total) for n in sc2]
        probs.sort(key=lambda x: x[1], reverse=True)
        results[d] = probs[:5]

    # Print concise outputs
    print("BASIC_COUNTS")
    print("total_observed_days:", sum(stats["overall_counter"].values()))
    print("odd_even:", dict(stats["odd_even_counter"]))
    print("prime_nonprime:", dict(stats["prime_counter"]))

    print("\nTOP_FREQ_OVERALL")
    print(format_counter_top(stats["overall_counter"], topn=15))

    print("\nTOP_LAST_DIGITS")
    print(format_counter_top(stats["last_digit_counter"], topn=10))

    print("\nCYCLES")
    for k, v in cycles.items():
        print(k, ":", round(v, 3))

    print("\nGAP_SUMMARY_TOP")
    # Top numbers by count of gaps
    gap_counts = sorted(gap_summary.items(), key=lambda x: (-x[1]["count"], x[0]))[:10]
    print("num | count | avg_gap | min | max")
    print("---: | ---: | ---: | ---: | ---:")
    for n, g in gap_counts:
        print(f"{n} | {g['count']} | {g['avg_gap']:.1f} | {g['min_gap']} | {g['max_gap']}")

    print("\nSAME_WEEKDAY_TRANSITIONS_TOP")
    for d in range(7):
        # Aggregate most common 'from' values
        agg = Counter()
        for from_v, ctr in same_weekday_counts[d].items():
            agg[from_v] = sum(ctr.values())
        tops = agg.most_common(3)
        print(f"{WEEKDAYS[d]} from-tops:", tops)
        for from_v, _ in tops:
            nxt = same_weekday_counts[d][from_v].most_common(5)
            print(f"  {from_v} -> {nxt}")

    print("\nPREDICTIONS_NEXT_WEEK")
    start_day = 0
    for i in range(7):
        if last_week[i] is None:
            start_day = i
            break
    for d in range(start_day, 7):
        arr = results.get(d, [])
        s = ", ".join([f"{int(n)}:{round(p*100,1)}%" for n, p in arr[:5]])
        print(f"{WEEKDAYS[d]} | {s}")


if __name__ == "__main__":
    main()

